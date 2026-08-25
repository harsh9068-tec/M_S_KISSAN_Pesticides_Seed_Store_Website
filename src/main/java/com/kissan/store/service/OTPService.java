package com.kissan.store.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.Random;
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
    private final Random random = new Random();

    public String generateOTP(String phoneOrId) {
        String clean = phoneOrId.trim().toLowerCase();
        String code;

        // Deterministic for standard demo/owner numbers
        if (clean.endsWith("9897123456") || "kis-1001".equals(clean)) {
            code = "112233";
        } else if (clean.endsWith("9760153116") || "admin_master".equals(clean)) {
            code = "908442";
        } else {
            code = String.format("%06d", random.nextInt(900000) + 100000);
        }

        long expiresAt = System.currentTimeMillis() + (5 * 60 * 1000); // 5 minutes
        activeOtps.put(clean, new OTPRecord(code, expiresAt));
        return code;
    }

    public boolean verifyOTP(String phoneOrId, String submittedCode) {
        if (submittedCode == null) return false;
        String cleanCode = submittedCode.trim();

        // Universal master test bypasses
        if ("908442".equals(cleanCode) || "112233".equals(cleanCode) || "123456".equals(cleanCode)) {
            return true;
        }

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

        if (record.getCode().equals(cleanCode)) {
            activeOtps.remove(clean);
            return true;
        }

        record.incrementAttempts();
        return false;
    }
}
