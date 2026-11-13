package com.kissan.store;

import com.kissan.store.config.AdminAuthInterceptor;
import com.kissan.store.service.AdminAuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

public class AdminAuthInterceptorTest {

    private AdminAuthInterceptor interceptor;
    private AdminAuthService adminAuthService;

    @BeforeEach
    void setUp() {
        interceptor = new AdminAuthInterceptor();
        adminAuthService = new AdminAuthService();
        ReflectionTestUtils.setField(interceptor, "adminAuthService", adminAuthService);
    }

    @Test
    @DisplayName("Public Endpoints: GET products & OPTIONS preflight allow unauthenticated access")
    void testPublicEndpointsAllowed() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/v1/products");
        MockHttpServletResponse res = new MockHttpServletResponse();
        assertThat(interceptor.preHandle(req, res, new Object())).isTrue();

        MockHttpServletRequest optReq = new MockHttpServletRequest("OPTIONS", "/api/v1/products");
        MockHttpServletResponse optRes = new MockHttpServletResponse();
        assertThat(interceptor.preHandle(optReq, optRes, new Object())).isTrue();
    }

    @Test
    @DisplayName("Protected Endpoints: Without token, DELETE /products returns 401 Unauthorized")
    void testProtectedWithoutTokenReturns401() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("DELETE", "/api/v1/products/prod_123");
        MockHttpServletResponse res = new MockHttpServletResponse();

        boolean result = interceptor.preHandle(req, res, new Object());
        assertThat(result).isFalse();
        assertThat(res.getStatus()).isEqualTo(401);
    }

    @Test
    @DisplayName("Protected Endpoints: Full Database Export /backup/export-json requires token")
    void testBackupWithoutTokenReturns401() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/v1/backup/export-json");
        MockHttpServletResponse res = new MockHttpServletResponse();

        boolean result = interceptor.preHandle(req, res, new Object());
        assertThat(result).isFalse();
        assertThat(res.getStatus()).isEqualTo(401);
    }

    @Test
    @DisplayName("Protected Endpoints: With valid X-Admin-Token succeeds")
    void testProtectedWithValidTokenSucceeds() throws Exception {
        String token = adminAuthService.issueSessionToken();

        MockHttpServletRequest req = new MockHttpServletRequest("DELETE", "/api/v1/products/prod_123");
        req.addHeader("X-Admin-Token", token);
        MockHttpServletResponse res = new MockHttpServletResponse();

        boolean result = interceptor.preHandle(req, res, new Object());
        assertThat(result).isTrue();
    }
}

