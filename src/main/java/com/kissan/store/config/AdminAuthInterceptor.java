package com.kissan.store.config;

import com.kissan.store.service.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Enterprise Security Interceptor for Admin Operations.
 * Protects administrative and data-exfiltration endpoints while
 * keeping customer-facing storefront and farmer portal operations accessible.
 */
@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    @Autowired
    private AdminAuthService adminAuthService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String method = request.getMethod();

        // 1. Allow CORS preflight requests
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        String uri = request.getRequestURI();

        // 2. Determine if endpoint requires Admin Authorization
        boolean requiresAdmin = false;

        if (uri.startsWith("/api/v1/backup")) {
            requiresAdmin = true;
        } else if (uri.equals("/api/v1/payment/orders")) {
            requiresAdmin = true;
        } else if (uri.startsWith("/api/v1/products") && ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method))) {
            requiresAdmin = true;
        } else if (uri.equals("/api/v1/farmers") && "GET".equalsIgnoreCase(method)) {
            requiresAdmin = true;
        } else if (uri.startsWith("/api/v1/farmers/") && "DELETE".equalsIgnoreCase(method)) {
            requiresAdmin = true;
        }

        if (!requiresAdmin) {
            return true;
        }

        // 3. Extract and validate Admin Session Token
        String token = request.getHeader("X-Admin-Token");
        if (token == null || token.trim().isEmpty()) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
                token = authHeader.substring(7).trim();
            }
        }

        if (token != null && adminAuthService.isValidSessionToken(token)) {
            return true;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"success\":false,\"error\":\"Unauthorized\",\"message\":\"Valid admin session token required for this operation.\"}");
        return false;
    }
}
