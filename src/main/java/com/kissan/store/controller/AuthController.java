package com.kissan.store.controller;

import com.kissan.store.service.AdminAuthService;
import com.kissan.store.service.OTPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final String ADMIN_MOBILE = "919760153116";

    @Autowired
    private OTPService otpService;

    @Autowired
    private AdminAuthService adminAuthService;

    @PostMapping("/otp/generate")
    public ResponseEntity<?> generateOTP(@RequestBody Map<String, String> body) {
        String phoneOrId = body.get("phoneOrId");
        if (phoneOrId == null || phoneOrId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Phone or ID is required."));
        }

        otpService.generateOTP(phoneOrId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "phoneOrId", phoneOrId,
                "expiresInSec", 300,
                "message", "OTP sent securely to registered mobile."
        ));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<?> verifyOTP(@RequestBody Map<String, String> body) {
        String phoneOrId = body.get("phoneOrId");
        String code = body.get("code");

        if (phoneOrId == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Phone and OTP code are required."));
        }

        boolean valid = otpService.verifyOTP(phoneOrId, code);
        if (valid) {
            return ResponseEntity.ok(Map.of("success", true, "message", "OTP verified successfully."));
        } else {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid or expired OTP."));
        }
    }

    @PostMapping("/admin/verify-pin")
    public ResponseEntity<?> verifyAdminPin(@RequestBody Map<String, String> body) {
        String pin = body.get("pin");
        if (pin != null && adminAuthService.isPinValid(pin)) {
            // Generate server-side 2FA OTP
            String otpCode = adminAuthService.generateAdminOTP();
            String waText = "🔐 M/S KISSAN Admin OTP\n\nYour 2FA verification code is: *" + otpCode +
                    "*\n\nValid for 5 minutes. Do NOT share with anyone.\n\n- M/S KISSAN Security System";
            String waUrl = "https://wa.me/" + ADMIN_MOBILE + "?text=" + URLEncoder.encode(waText, StandardCharsets.UTF_8);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "role", "ADMIN",
                    "otpRequired", true,
                    "otp", otpCode,
                    "whatsappUrl", waUrl,
                    "message", "PIN verified. 2FA OTP generated successfully."
            ));
        }
        return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid Admin PIN."));
    }

    @PostMapping("/admin/verify-2fa")
    public ResponseEntity<?> verifyAdmin2FA(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "2FA OTP code is required."));
        }

        boolean valid = adminAuthService.verifyAdminOTP(code.trim());
        if (valid) {
            String token = adminAuthService.issueSessionToken();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "role", "ADMIN",
                    "expiresInSec", 28800,
                    "message", "2FA verified successfully. Admin session token issued."
            ));
        }
        return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid or expired 2FA OTP."));
    }

    @PostMapping("/admin/logout")
    public ResponseEntity<?> logoutAdmin(@RequestHeader(value = "X-Admin-Token", required = false) String headerToken,
                                         @RequestBody(required = false) Map<String, String> body) {
        String token = headerToken;
        if ((token == null || token.isEmpty()) && body != null) {
            token = body.get("token");
        }
        if (token != null) {
            adminAuthService.revokeSessionToken(token);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully."));
    }

    @GetMapping("/admin/check-session")
    public ResponseEntity<?> checkSession(@RequestHeader(value = "X-Admin-Token", required = false) String headerToken) {
        if (headerToken != null && adminAuthService.isValidSessionToken(headerToken)) {
            return ResponseEntity.ok(Map.of("success", true, "valid", true));
        }
        return ResponseEntity.status(401).body(Map.of("success", false, "valid", false));
    }
}
