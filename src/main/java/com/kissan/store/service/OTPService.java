package com.kissan.store.service;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OTPService {

    public static class OTPRecord {
        private final String code;
        private final long expiresAt;
        private int attempts;

        public OTPRecord(String code, long expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
            this.attempts = 0;
        }

        public String getCode() { return code; }
        public long getExpiresAt() { return expiresAt; }
        public int getAttempts() { return attempts; }
        public void incrementAttempts() { this.attempts++; }
    }

    private final Map<String, OTPRecord> activeOtps = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    public String generateOTP(String phoneOrId) {
        String clean = phoneOrId.trim().toLowerCase();
        // Cryptographically secure 6-digit OTP using SecureRandom
        String code = String.format("%06d", secureRandom.nextInt(900000) + 100000);

        long expiresAt = System.currentTimeMillis() + (5 * 60 * 1000); // 5 minutes
        activeOtps.put(clean, new OTPRecord(code, expiresAt));
        return code;
    }

    public boolean verifyOTP(String phoneOrId, String submittedCode) {
        if (submittedCode == null) return false;
        String cleanCode = submittedCode.trim();

        String clean = phoneOrId.trim().toLowerCase();
        OTPRecord record = activeOtps.get(clean);
        if (record == null) return false;

        if (System.currentTimeMillis() > record.getExpiresAt()) {
            activeOtps.remove(clean);
            return false;
        }

        if (record.getAttempts() >= 3) {
            activeOtps.remove(clean);
            return false;
        }

        // Constant-time comparison to prevent timing side-channel attacks
        boolean matches = MessageDigest.isEqual(
                record.getCode().getBytes(StandardCharsets.UTF_8),
                cleanCode.getBytes(StandardCharsets.UTF_8)
        );

        if (matches) {
            activeOtps.remove(clean);
            return true;
        }

        record.incrementAttempts();
        return false;
    }
}
