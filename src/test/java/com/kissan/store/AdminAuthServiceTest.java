package com.kissan.store;

import com.kissan.store.service.AdminAuthService;
import com.kissan.store.service.OTPService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

public class AdminAuthServiceTest {

    private AdminAuthService adminAuthService;
    private OTPService otpService;

    @BeforeEach
    void setUp() {
        otpService = new OTPService();
        adminAuthService = new AdminAuthService();
        ReflectionTestUtils.setField(adminAuthService, "otpService", otpService);
    }

    @Test
    @DisplayName("Verify Admin PIN: Correct PIN returns true, wrong PIN returns false")
    void testPinValidation() {
        assertThat(adminAuthService.isPinValid("908442")).isTrue();
        assertThat(adminAuthService.isPinValid("0000")).isFalse();
        assertThat(adminAuthService.isPinValid(null)).isFalse();
        assertThat(adminAuthService.isPinValid("")).isFalse();
    }

    @Test
    @DisplayName("2FA OTP Flow: Generation, Verification & Session Token Issuance")
    void testAdmin2FAAndSessionTokens() {
        String otp = adminAuthService.generateAdminOTP();
        assertThat(otp).hasSize(6).containsOnlyDigits();

        // Wrong OTP fails
        boolean wrongCheck = adminAuthService.verifyAdminOTP("999999");
        assertThat(wrongCheck).isFalse();

        // Re-generate OTP for clean attempt
        otp = adminAuthService.generateAdminOTP();
        boolean validCheck = adminAuthService.verifyAdminOTP(otp);
        assertThat(validCheck).isTrue();

        // Issue session token
        String token = adminAuthService.issueSessionToken();
        assertThat(token).startsWith("kissan_adm_");
        assertThat(adminAuthService.isValidSessionToken(token)).isTrue();

        // Unknown or empty token is rejected
        assertThat(adminAuthService.isValidSessionToken("fake_token")).isFalse();
        assertThat(adminAuthService.isValidSessionToken(null)).isFalse();

        // Revoke token (logout)
        adminAuthService.revokeSessionToken(token);
        assertThat(adminAuthService.isValidSessionToken(token)).isFalse();
    }
}
