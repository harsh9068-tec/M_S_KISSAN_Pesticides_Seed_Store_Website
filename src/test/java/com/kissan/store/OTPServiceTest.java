package com.kissan.store;

import com.kissan.store.service.OTPService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class OTPServiceTest {

    private OTPService otpService;

    @BeforeEach
    void setUp() {
        otpService = new OTPService();
    }

    @Test
    @DisplayName("OTP Generation: Returns 6-digit cryptographically secure code")
    void testGenerateOTP() {
        String code = otpService.generateOTP("9897123456");
        assertThat(code).isNotNull().hasSize(6).containsOnlyDigits();
    }

    @Test
    @DisplayName("OTP Verification: Correct code succeeds, single-use invalidation")
    void testVerifyOTPSuccess() {
        String phone = "9897123456";
        String code = otpService.generateOTP(phone);

        boolean ok = otpService.verifyOTP(phone, code);
        assertThat(ok).isTrue();

        // Single-use: Second attempt must fail
        boolean secondTry = otpService.verifyOTP(phone, code);
        assertThat(secondTry).isFalse();
    }

    @Test
    @DisplayName("Brute-Force Protection: Locks out after 3 incorrect attempts")
    void testBruteForceLockout() {
        String phone = "9897999888";
        String code = otpService.generateOTP(phone);

        assertThat(otpService.verifyOTP(phone, "000000")).isFalse();
        assertThat(otpService.verifyOTP(phone, "000001")).isFalse();
        assertThat(otpService.verifyOTP(phone, "000002")).isFalse();

        // 4th attempt even with correct code must fail due to max attempts reached
        assertThat(otpService.verifyOTP(phone, code)).isFalse();
    }
}

