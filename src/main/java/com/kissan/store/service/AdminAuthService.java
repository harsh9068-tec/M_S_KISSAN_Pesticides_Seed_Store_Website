package com.kissan.store.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Enterprise Security Service for Admin 2FA Authentication,
 * Session Management, and Cryptographic Token Verification.
 */
@Service
public class AdminAuthService {

    private static final String SALT = "kissan_salt_2026_";
    private static final String DEFAULT_PIN_HASH = "95bf354170abc2e982d3ce6a35e98ca0e76a4118ca2d2dc9702dad53782f75e9";
    private static final long SESSION_TTL_MILLIS = 8 * 60 * 60 * 1000L; // 8 hours

    private final Map<String, Long> activeSessions = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    private OTPService otpService;

    public boolean isPinValid(String pin) {
        if (pin == null || pin.trim().isEmpty()) return false;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest((SALT + pin.trim()).getBytes(StandardCharsets.UTF_8));
            String computedHash = HexFormat.of().formatHex(hashBytes);
            return MessageDigest.isEqual(
                    DEFAULT_PIN_HASH.getBytes(StandardCharsets.UTF_8),
                    computedHash.toLowerCase().getBytes(StandardCharsets.UTF_8)
            );
        } catch (NoSuchAlgorithmException e) {
            return false;
        }
    }

    public String generateAdminOTP() {
        return otpService.generateOTP("admin_master");
    }

    public boolean verifyAdminOTP(String code) {
        return otpService.verifyOTP("admin_master", code);
    }

    public String issueSessionToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String token = "kissan_adm_" + HexFormat.of().formatHex(randomBytes);
        activeSessions.put(token, System.currentTimeMillis() + SESSION_TTL_MILLIS);
        return token;
    }

    public boolean isValidSessionToken(String token) {
        if (token == null || token.trim().isEmpty()) return false;
        String cleanToken = token.trim();
        Long expiresAt = activeSessions.get(cleanToken);
        if (expiresAt == null) return false;

        if (System.currentTimeMillis() > expiresAt) {
            activeSessions.remove(cleanToken);
            return false;
        }
        return true;
    }

    public void revokeSessionToken(String token) {
        if (token != null) {
            activeSessions.remove(token.trim());
        }
    }
}

