package com.kissan.store.controller;

import com.kissan.store.service.OTPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private OTPService otpService;

    @PostMapping("/otp/generate")
    public ResponseEntity<?> generateOTP(@RequestBody Map<String, String> body) {
        String phoneOrId = body.get("phoneOrId");
        if (phoneOrId == null || phoneOrId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Phone or ID is required."));
        }

        String code = otpService.generateOTP(phoneOrId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "code", code,
                "phoneOrId", phoneOrId,
                "expiresInSec", 300
        ));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<?> verifyOTP(@RequestBody Map<String, String> body) {
        String phoneOrId = body.get("phoneOrId");
        String code = body.get("code");

        if (phoneOrId == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Phone and Code are required."));
        }

        boolean valid = otpService.verifyOTP(phoneOrId, code);
        if (valid) {
            return ResponseEntity.ok(Map.of("success", true, "message", "OTP verified successfully!"));
        } else {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid or expired OTP."));
        }
    }

    @PostMapping("/admin/verify-pin")
    public ResponseEntity<?> verifyAdminPin(@RequestBody Map<String, String> body) {
        String pin = body.get("pin");
        if ("908442".equals(pin)) {
            String admin2faCode = otpService.generateOTP("admin_master");
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "requires2fa", true,
                    "adminPhone", "9760153116",
                    "admin2faCode", admin2faCode
            ));
        }
        return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid Security PIN."));
    }
}
