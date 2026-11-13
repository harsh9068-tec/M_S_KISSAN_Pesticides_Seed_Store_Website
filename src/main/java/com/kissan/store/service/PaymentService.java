package com.kissan.store.service;

import com.kissan.store.dto.PaymentOrderRequest;
import com.kissan.store.dto.PaymentVerifyRequest;
import com.kissan.store.model.Invoice;
import com.kissan.store.model.KhataTransaction;
import com.kissan.store.model.PaymentOrder;
import com.kissan.store.repository.PaymentOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Value("${razorpay.key.id:rzp_test_kissanstore}")
    private String keyId;

    @Value("${razorpay.key.secret:kissan_secret_demo_key}")
    private String keySecret;

    @Value("${razorpay.currency:INR}")
    private String currency;

    @Value("${razorpay.company.name:M/S KISSAN Pesticides & Seed Store}")
    private String companyName;

    @Autowired
    private PaymentOrderRepository paymentOrderRepository;

    @Autowired
    private FarmerService farmerService;

    @Autowired
    private InvoiceService invoiceService;

    private RestTemplate restTemplate;

    public PaymentService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2500);
        factory.setReadTimeout(3000);
        this.restTemplate = new RestTemplate(factory);
    }

    public void setRestTemplate(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> getPaymentConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("keyId", keyId);
        config.put("currency", currency);
        config.put("companyName", companyName);
        config.put("isTestMode", keyId.startsWith("rzp_test_") || keySecret.contains("demo") || keySecret.contains("test"));
        return config;
    }

    /**
     * Creates an order with Razorpay Gateway or in resilient test mode.
     */
    @Transactional
    public Map<String, Object> createOrder(PaymentOrderRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Payment order request cannot be null.");
        }
        Double amount = request.getAmount();
        if (amount == null || amount <= 0 || Double.isNaN(amount) || Double.isInfinite(amount)) {
            throw new IllegalArgumentException("Invalid order amount. Amount must be a positive number.");
        }

        double amountInRupees = Math.round(amount * 100.0) / 100.0;
        long amountInPaise = Math.round(amountInRupees * 100);
        String receiptId = "rcpt_" + System.currentTimeMillis();
        String generatedOrderId = null;

        // Try calling Razorpay official REST API only if live production credentials provided (never in test/demo mode)
        boolean isLiveProduction = keyId != null && keyId.startsWith("rzp_live_")
                && !keyId.contains("demo") && !keyId.contains("test")
                && keySecret != null && !keySecret.contains("demo") && !keySecret.contains("test");

        if (isLiveProduction) {
            try {
                String razorpayUrl = "https://api.razorpay.com/v1/orders";
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBasicAuth(keyId, keySecret);

                Map<String, Object> rzpBody = new HashMap<>();
                rzpBody.put("amount", amountInPaise);
                rzpBody.put("currency", currency);
                rzpBody.put("receipt", receiptId);
                rzpBody.put("payment_capture", 1);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(rzpBody, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(razorpayUrl, entity, Map.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    generatedOrderId = (String) response.getBody().get("id");
                }
            } catch (Exception e) {
                logger.warn("Razorpay API external order call notice: {}. Using resilient order ID.", e.getMessage());
            }
        }

        if (generatedOrderId == null) {
            generatedOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        }

        PaymentOrder paymentOrder = new PaymentOrder(
                generatedOrderId,
                sanitize(request.getFarmerId(), 50),
                sanitize(request.getFarmerName(), 100),
                sanitize(request.getFarmerMobile(), 20),
                amountInRupees,
                request.getPurpose() != null ? sanitize(request.getPurpose(), 50) : "PRODUCT_PURCHASE",
                sanitize(request.getProductDetails(), 1000),
                receiptId
        );
        paymentOrder.setNotes(sanitize(request.getNotes(), 500));
        paymentOrderRepository.save(paymentOrder);

        Map<String, Object> result = new HashMap<>();
        result.put("orderId", generatedOrderId);
        result.put("amount", amountInRupees);
        result.put("amountPaise", amountInPaise);
        result.put("currency", currency);
        result.put("keyId", keyId);
        result.put("companyName", companyName);
        result.put("receipt", receiptId);
        return result;
    }

    /**
     * Verifies Razorpay HMAC-SHA256 signature and records payment idempotently.
     */
    @Transactional
    public Map<String, Object> verifyPayment(PaymentVerifyRequest verifyReq) {
        Map<String, Object> response = new HashMap<>();
        if (verifyReq == null) {
            response.put("success", false);
            response.put("message", "Verification request cannot be null.");
            return response;
        }

        String orderId = verifyReq.getRazorpayOrderId();
        String paymentId = verifyReq.getRazorpayPaymentId();
        String signature = verifyReq.getRazorpaySignature();

        if (orderId == null || orderId.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Razorpay Order ID is required.");
            return response;
        }

        Optional<PaymentOrder> optOrder = paymentOrderRepository.findByOrderId(orderId.trim());
        PaymentOrder order = optOrder.orElseGet(() -> {
            PaymentOrder newOrder = new PaymentOrder(
                    orderId.trim(),
                    sanitize(verifyReq.getFarmerId(), 50),
                    sanitize(verifyReq.getFarmerName(), 100),
                    sanitize(verifyReq.getFarmerMobile(), 20),
                    verifyReq.getAmount() != null && verifyReq.getAmount() > 0 ? verifyReq.getAmount() : 0.0,
                    sanitize(verifyReq.getPurpose(), 50),
                    sanitize(verifyReq.getProductDetails(), 1000),
                    "rcpt_" + System.currentTimeMillis()
            );
            return paymentOrderRepository.save(newOrder);
        });

        // Idempotency guard: Prevent double-crediting or duplicate invoice creation
        if ("SUCCESS".equalsIgnoreCase(order.getStatus())) {
            response.put("success", true);
            response.put("message", "Payment has already been verified and processed.");
            response.put("orderId", order.getOrderId());
            response.put("paymentId", order.getPaymentId());
            response.put("amount", order.getAmount());
            response.put("paidAt", order.getPaidAt());
            return response;
        }

        boolean isValid = false;
        boolean isDemo = keyId.startsWith("rzp_test_") || keySecret.contains("demo");

        if (isDemo && (signature == null || signature.isEmpty() || signature.startsWith("demo_sig_") || signature.startsWith("sim_"))) {
            isValid = true;
        } else if (signature != null && !signature.isEmpty() && paymentId != null && !paymentId.isEmpty()) {
            isValid = verifyRazorpaySignature(orderId, paymentId, signature, keySecret);
        }

        if (!isValid) {
            order.setStatus("FAILED");
            order.setSignature(signature);
            paymentOrderRepository.save(order);
            response.put("success", false);
            response.put("message", "Payment signature verification failed.");
            return response;
        }

        // Update payment order to SUCCESS
        order.setStatus("SUCCESS");
        order.setPaymentId(paymentId != null ? paymentId : "pay_" + System.currentTimeMillis());
        order.setSignature(signature != null ? signature : "verified_sig_" + System.currentTimeMillis());
        order.setPaidAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        if (verifyReq.getFarmerId() != null) order.setFarmerId(sanitize(verifyReq.getFarmerId(), 50));
        if (verifyReq.getFarmerName() != null) order.setFarmerName(sanitize(verifyReq.getFarmerName(), 100));
        if (verifyReq.getFarmerMobile() != null) order.setFarmerMobile(sanitize(verifyReq.getFarmerMobile(), 20));
        paymentOrderRepository.save(order);

        // Apply business logic based on payment purpose
        String purpose = verifyReq.getPurpose() != null ? verifyReq.getPurpose() : order.getPurpose();
        String createdInvoiceId = null;

        if ("KHATA_PAYMENT".equalsIgnoreCase(purpose) && order.getFarmerId() != null && !order.getFarmerId().isEmpty()) {
            try {
                KhataTransaction tx = new KhataTransaction(
                        "tx_pay_" + System.currentTimeMillis(),
                        LocalDate.now().toString(),
                        "payment",
                        "Online Payment (" + order.getPaymentId() + ")",
                        "1 Online Tx",
                        0.0,
                        order.getAmount(),
                        0.0,
                        "Razorpay Online Payment (UPI/Cards) - Order #" + order.getOrderId(),
                        null
                );
                farmerService.addKhataEntry(order.getFarmerId(), tx);
            } catch (Exception e) {
                logger.error("Error crediting farmer Khata: {}", e.getMessage());
            }
        } else {
            try {
                Invoice inv = new Invoice();
                inv.setFarmerId(order.getFarmerId() != null ? order.getFarmerId() : "GUEST");
                inv.setFarmerName(order.getFarmerName() != null ? order.getFarmerName() : "Online Customer");
                inv.setFarmerMobile(order.getFarmerMobile() != null ? order.getFarmerMobile() : "N/A");
                inv.setFarmerVillage(verifyReq.getFarmerVillage() != null ? sanitize(verifyReq.getFarmerVillage(), 100) : "Online Order");
                inv.setGrandTotal(order.getAmount());
                inv.setPaidAmount(order.getAmount());
                inv.setBalanceDue(0.0);
                inv.setPaymentMode("Razorpay Gateway (UPI/Card)");
                inv.setStatus("Paid");
                inv.setNotes("Online Tx ID: " + order.getPaymentId() + " | Item: " + (order.getProductDetails() != null ? order.getProductDetails() : "Seeds/Pesticides"));

                Invoice savedInvoice = invoiceService.createInvoice(inv);
                createdInvoiceId = savedInvoice != null ? savedInvoice.getId() : null;
            } catch (Exception e) {
                logger.error("Error creating invoice for online payment: {}", e.getMessage());
            }
        }

        response.put("success", true);
        response.put("message", "Payment verified and processed successfully!");
        response.put("orderId", order.getOrderId());
        response.put("paymentId", order.getPaymentId());
        response.put("amount", order.getAmount());
        response.put("invoiceId", createdInvoiceId);
        response.put("paidAt", order.getPaidAt());
        return response;
    }

    public List<PaymentOrder> getAllOrders() {
        return paymentOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<PaymentOrder> getOrdersByFarmer(String farmerId) {
        if (farmerId == null || farmerId.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return paymentOrderRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId.trim());
    }

    /**
     * Constant-time HMAC-SHA256 signature verification to prevent timing attacks.
     */
    public boolean verifyRazorpaySignature(String orderId, String paymentId, String signature, String secret) {
        if (orderId == null || paymentId == null || signature == null || secret == null) {
            return false;
        }
        try {
            String data = orderId + "|" + paymentId;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secretKey);
            byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }

            // Constant-time comparison
            return MessageDigest.isEqual(
                    hexString.toString().getBytes(StandardCharsets.UTF_8),
                    signature.trim().toLowerCase().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            logger.error("Signature calculation exception: {}", e.getMessage());
            return false;
        }
    }

    private String sanitize(String input, int maxLength) {
        if (input == null) return null;
        String clean = input.trim();
        return clean.length() > maxLength ? clean.substring(0, maxLength) : clean;
    }
}
