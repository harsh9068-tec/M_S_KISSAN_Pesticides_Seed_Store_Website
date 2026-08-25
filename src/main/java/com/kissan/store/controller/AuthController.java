package com.kissan.store.controller;

import com.kissan.store.service.OTPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final String SALT = "kissan_salt_2026_";
    private static final String DEFAULT_PIN_HASH = "95bf354170abc2e982d3ce6a35e98ca0e76a4118ca2d2dc9702dad53782f75e9";

    @Autowired
    private OTPService otpService;

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
        if (pin != null && isPinValid(pin)) {
            return ResponseEntity.ok(Map.of("success", true, "role", "ADMIN"));
        }
        return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid Admin PIN."));
    }

    private boolean isPinValid(String pin) {
        if (pin == null || pin.trim().isEmpty()) return false;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest((SALT + pin.trim()).getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hashBytes) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) hex.append('0');
                hex.append(h);
            }
            return DEFAULT_PIN_HASH.equalsIgnoreCase(hex.toString());
        } catch (NoSuchAlgorithmException e) {
            return false;
        }
    }
}
