package com.kissan.store.controller;

import com.kissan.store.dto.PaymentOrderRequest;
import com.kissan.store.dto.PaymentVerifyRequest;
import com.kissan.store.model.PaymentOrder;
import com.kissan.store.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Razorpay / Online Payment Gateway operations.
 */
@RestController
@RequestMapping("/api/v1/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /**
     * Get Payment Gateway public configuration (Key ID, Currency, etc.)
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getPaymentConfig() {
        return ResponseEntity.ok(paymentService.getPaymentConfig());
    }

    /**
     * Create Razorpay payment order
     */
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody PaymentOrderRequest request) {
        return ResponseEntity.ok(paymentService.createOrder(request));
    }

    /**
     * Verify payment signature and record order in Khata / Invoices
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody PaymentVerifyRequest request) {
        Map<String, Object> result = paymentService.verifyPayment(request);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        if (success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Get all payment orders (Admin / Store Owner)
     */
    @GetMapping("/orders")
    public ResponseEntity<List<PaymentOrder>> getAllOrders() {
        return ResponseEntity.ok(paymentService.getAllOrders());
    }

    /**
     * Get payment orders by farmer ID
     */
    @GetMapping("/orders/farmer/{farmerId}")
    public ResponseEntity<List<PaymentOrder>> getOrdersByFarmer(@PathVariable String farmerId) {
        return ResponseEntity.ok(paymentService.getOrdersByFarmer(farmerId));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage() != null ? e.getMessage() : "Invalid input parameters"
        ));
    }
}
