package com.kissan.store;

import com.kissan.store.dto.PaymentOrderRequest;
import com.kissan.store.dto.PaymentVerifyRequest;
import com.kissan.store.model.Invoice;
import com.kissan.store.model.KhataTransaction;
import com.kissan.store.model.PaymentOrder;
import com.kissan.store.repository.PaymentOrderRepository;
import com.kissan.store.service.FarmerService;
import com.kissan.store.service.InvoiceService;
import com.kissan.store.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.lang.reflect.Proxy;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Senior Software Tester Test Suite for Payment Gateway Service.
 * Implements resilient native test doubles compatible across all Java versions (including Java 21, 24, 25+).
 * Runs 113+ thorough iterations covering stress fuzzing, cryptography, boundary limits, and idempotency.
 */
public class PaymentServiceTest {

    private PaymentService paymentService;
    private FakeFarmerService fakeFarmerService;
    private FakeInvoiceService fakeInvoiceService;
    private Map<String, PaymentOrder> ordersDatabase;

    private static final String SECRET = "test_kissan_secret_key_2026";
    private static final String KEY_ID = "rzp_live_kissan_store_id";

    @BeforeEach
    void setUp() {
        ordersDatabase = new LinkedHashMap<>();
        fakeFarmerService = new FakeFarmerService();
        fakeInvoiceService = new FakeInvoiceService();

        // Native Java Dynamic Proxy for PaymentOrderRepository (no bytecode instrumentation needed)
        PaymentOrderRepository fakeRepository = (PaymentOrderRepository) Proxy.newProxyInstance(
                PaymentOrderRepository.class.getClassLoader(),
                new Class<?>[]{PaymentOrderRepository.class},
                (proxy, method, args) -> {
                    String methodName = method.getName();
                    if ("save".equals(methodName)) {
                        PaymentOrder po = (PaymentOrder) args[0];
                        ordersDatabase.put(po.getOrderId(), po);
                        return po;
                    }
                    if ("findByOrderId".equals(methodName)) {
                        String orderId = (String) args[0];
                        return Optional.ofNullable(ordersDatabase.get(orderId));
                    }
                    if ("findByPaymentId".equals(methodName)) {
                        String payId = (String) args[0];
                        return ordersDatabase.values().stream()
                                .filter(p -> payId.equals(p.getPaymentId()))
                                .findFirst();
                    }
                    if ("findAllByOrderByCreatedAtDesc".equals(methodName)) {
                        return new ArrayList<>(ordersDatabase.values());
                    }
                    if ("findByFarmerIdOrderByCreatedAtDesc".equals(methodName)) {
                        String farmerId = (String) args[0];
                        return ordersDatabase.values().stream()
                                .filter(p -> farmerId.equals(p.getFarmerId()))
                                .toList();
                    }
                    return null;
                }
        );

        paymentService = new PaymentService();
        ReflectionTestUtils.setField(paymentService, "keyId", KEY_ID);
        ReflectionTestUtils.setField(paymentService, "keySecret", SECRET);
        ReflectionTestUtils.setField(paymentService, "currency", "INR");
        ReflectionTestUtils.setField(paymentService, "companyName", "M/S KISSAN Store");
        ReflectionTestUtils.setField(paymentService, "paymentOrderRepository", fakeRepository);
        ReflectionTestUtils.setField(paymentService, "farmerService", fakeFarmerService);
        ReflectionTestUtils.setField(paymentService, "invoiceService", fakeInvoiceService);
    }

    // =========================================================================
    // 1. REPEATED STRESS & FUZZ TESTING: 50 ITERATIONS OF ORDER CREATION
    // =========================================================================

    @RepeatedTest(50)
    @DisplayName("Stress Test: 50 Iterations of Order Creation with Randomized Input Data")
    void testOrderCreation_50IterationsStressTest() {
        Random rng = new Random();
        double amount = 10.0 + (rng.nextDouble() * 5000.0);
        String farmerId = "KIS-" + (1000 + rng.nextInt(9000));
        String farmerName = "Farmer " + rng.nextInt(100);
        String mobile = "98" + (10000000 + rng.nextInt(90000000));

        PaymentOrderRequest req = new PaymentOrderRequest();
        req.setAmount(amount);
        req.setFarmerId(farmerId);
        req.setFarmerName(farmerName);
        req.setFarmerMobile(mobile);
        req.setPurpose("PRODUCT_PURCHASE");
        req.setProductDetails("Syngenta Incipio 250ml");

        Map<String, Object> result = paymentService.createOrder(req);

        assertThat(result).isNotNull();
        assertThat(result.get("orderId")).isNotNull();
        String orderId = (String) result.get("orderId");
        assertThat(orderId).startsWith("order_");

        Double returnedAmount = (Double) result.get("amount");
        assertThat(returnedAmount).isPositive();
        assertThat((Long) result.get("amountPaise")).isEqualTo(Math.round(returnedAmount * 100));
        assertThat(result.get("currency")).isEqualTo("INR");
        assertThat(result.get("keyId")).isEqualTo(KEY_ID);
        assertThat(result.get("receipt")).isNotNull();

        assertThat(ordersDatabase.containsKey(orderId)).isTrue();
        PaymentOrder stored = ordersDatabase.get(orderId);
        assertThat(stored.getFarmerId()).isEqualTo(farmerId);
        assertThat(stored.getStatus()).isEqualTo("CREATED");
    }

    // =========================================================================
    // 2. BOUNDARY TESTING: INVALID AMOUNTS (ZERO, NEGATIVE, NAN, INFINITY)
    // =========================================================================

    @ParameterizedTest
    @ValueSource(doubles = {0.0, -0.01, -1.0, -500.0, -999999.0})
    @DisplayName("Boundary Test: Zero and Negative Amounts must throw IllegalArgumentException")
    void testCreateOrder_NegativeAndZeroAmounts(double invalidAmount) {
        PaymentOrderRequest req = new PaymentOrderRequest();
        req.setAmount(invalidAmount);

        assertThatThrownBy(() -> paymentService.createOrder(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Amount must be a positive number");
    }

    @Test
    @DisplayName("Boundary Test: NaN and Infinite Amounts must be rejected")
    void testCreateOrder_NaNAmount() {
        PaymentOrderRequest req = new PaymentOrderRequest();
        req.setAmount(Double.NaN);

        assertThatThrownBy(() -> paymentService.createOrder(req))
                .isInstanceOf(IllegalArgumentException.class);

        req.setAmount(Double.POSITIVE_INFINITY);
        assertThatThrownBy(() -> paymentService.createOrder(req))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Boundary Test: Null Request object must be rejected")
    void testCreateOrder_NullRequest() {
        assertThatThrownBy(() -> paymentService.createOrder(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Payment order request cannot be null");
    }

    // =========================================================================
    // 3. CRYPTOGRAPHIC SIGNATURE VERIFICATION: 50 DISTINCT CRYPTO VECTORS
    // =========================================================================

    @RepeatedTest(50)
    @DisplayName("Crypto Test: 50 Iterations of Native HMAC-SHA256 Exact Signature Verification")
    void testHmacSha256SignatureVerification_50Vectors() throws Exception {
        String orderId = "order_" + UUID.randomUUID().toString().substring(0, 10);
        String paymentId = "pay_" + UUID.randomUUID().toString().substring(0, 10);

        String validSignature = computeHmacSignature(orderId, paymentId, SECRET);

        // Positive Assertion: Must verify as TRUE
        boolean isSignatureValid = paymentService.verifyRazorpaySignature(orderId, paymentId, validSignature, SECRET);
        assertThat(isSignatureValid).isTrue();

        // Negative Assertion: Tamper signature by changing last character: must verify as FALSE
        char lastChar = validSignature.charAt(validSignature.length() - 1);
        char tamperedChar = (lastChar == 'a') ? 'b' : 'a';
        String tamperedSignature = validSignature.substring(0, validSignature.length() - 1) + tamperedChar;

        boolean isTamperedValid = paymentService.verifyRazorpaySignature(orderId, paymentId, tamperedSignature, SECRET);
        assertThat(isTamperedValid).isFalse();
    }

    @Test
    @DisplayName("Security Test: Null or Empty Signature inputs must safely return false")
    void testHmacSha256SignatureVerification_NullInputs() {
        assertThat(paymentService.verifyRazorpaySignature(null, "pay_123", "sig", SECRET)).isFalse();
        assertThat(paymentService.verifyRazorpaySignature("order_123", null, "sig", SECRET)).isFalse();
        assertThat(paymentService.verifyRazorpaySignature("order_123", "pay_123", null, SECRET)).isFalse();
        assertThat(paymentService.verifyRazorpaySignature("order_123", "pay_123", "sig", null)).isFalse();
        assertThat(paymentService.verifyRazorpaySignature("", "", "", "")).isFalse();
    }

    // =========================================================================
    // 4. IDEMPOTENCY & REPLAY ATTACK PREVENTION
    // =========================================================================

    @Test
    @DisplayName("Idempotency Test: Verifying an already SUCCESS payment must NOT duplicate Khata or Invoices")
    void testVerifyPayment_Idempotency_PreventDuplicateProcessing() {
        String orderId = "order_idempotent_123";
        PaymentOrder existingOrder = new PaymentOrder(orderId, "KIS-1001", "Ramesh Kumar", "9897123456", 750.0, "KHATA_PAYMENT", "Balance Payment", "rcpt_1");
        existingOrder.setStatus("SUCCESS");
        existingOrder.setPaymentId("pay_already_processed");
        existingOrder.setPaidAt("2026-10-15 10:00:00");
        ordersDatabase.put(orderId, existingOrder);

        PaymentVerifyRequest verifyReq = new PaymentVerifyRequest();
        verifyReq.setRazorpayOrderId(orderId);
        verifyReq.setRazorpayPaymentId("pay_replay_attempt");
        verifyReq.setRazorpaySignature("sig_replay");
        verifyReq.setFarmerId("KIS-1001");
        verifyReq.setAmount(750.0);
        verifyReq.setPurpose("KHATA_PAYMENT");

        Map<String, Object> response = paymentService.verifyPayment(verifyReq);

        assertThat(response.get("success")).isEqualTo(true);
        assertThat((String) response.get("message")).contains("already been verified");
        assertThat(response.get("paymentId")).isEqualTo("pay_already_processed");

        // CRITICAL: Ensure neither Khata nor Invoices were duplicated
        assertThat(fakeFarmerService.recordedTransactions).isEmpty();
        assertThat(fakeInvoiceService.createdInvoices).isEmpty();
    }

    // =========================================================================
    // 5. KHATA CREDIT INTEGRATION & INVOICE GENERATION
    // =========================================================================

    @Test
    @DisplayName("Integration Test: Successful Khata payment correctly credits Farmer ledger")
    void testVerifyPayment_KhataCreditSync() throws Exception {
        String orderId = "order_khata_test_888";
        String paymentId = "pay_khata_test_999";
        String signature = computeHmacSignature(orderId, paymentId, SECRET);

        PaymentOrder pendingOrder = new PaymentOrder(orderId, "KIS-2002", "Mahipal Singh", "9760153116", 1200.0, "KHATA_PAYMENT", "Due payment", "rcpt_888");
        ordersDatabase.put(orderId, pendingOrder);

        PaymentVerifyRequest req = new PaymentVerifyRequest();
        req.setRazorpayOrderId(orderId);
        req.setRazorpayPaymentId(paymentId);
        req.setRazorpaySignature(signature);
        req.setFarmerId("KIS-2002");
        req.setFarmerName("Mahipal Singh");
        req.setFarmerMobile("9760153116");
        req.setAmount(1200.0);
        req.setPurpose("KHATA_PAYMENT");

        Map<String, Object> result = paymentService.verifyPayment(req);

        assertThat(result.get("success")).isEqualTo(true);
        assertThat(pendingOrder.getStatus()).isEqualTo("SUCCESS");
        assertThat(pendingOrder.getPaymentId()).isEqualTo(paymentId);

        // Verify Khata entry was added in the fake ledger
        assertThat(fakeFarmerService.recordedTransactions).hasSize(1);
        KhataTransaction tx = fakeFarmerService.recordedTransactions.get(0);
        assertThat(tx.getPaid()).isEqualTo(1200.0);
        assertThat(tx.getType()).isEqualTo("payment");
    }

    @Test
    @DisplayName("Integration Test: Successful Store Product purchase creates Store Invoice")
    void testVerifyPayment_StoreInvoiceSync() throws Exception {
        String orderId = "order_inv_test_111";
        String paymentId = "pay_inv_test_222";
        String signature = computeHmacSignature(orderId, paymentId, SECRET);

        PaymentOrder pendingOrder = new PaymentOrder(orderId, "GUEST", "Surender Ji", "9897112233", 480.0, "PRODUCT_PURCHASE", "Syngenta Score 250ml", "rcpt_111");
        ordersDatabase.put(orderId, pendingOrder);

        PaymentVerifyRequest req = new PaymentVerifyRequest();
        req.setRazorpayOrderId(orderId);
        req.setRazorpayPaymentId(paymentId);
        req.setRazorpaySignature(signature);
        req.setAmount(480.0);
        req.setPurpose("PRODUCT_PURCHASE");
        req.setProductDetails("Syngenta Score 250ml");

        Map<String, Object> result = paymentService.verifyPayment(req);

        assertThat(result.get("success")).isEqualTo(true);
        assertThat(result.get("invoiceId")).isNotNull();
        assertThat(pendingOrder.getStatus()).isEqualTo("SUCCESS");

        assertThat(fakeInvoiceService.createdInvoices).hasSize(1);
        Invoice inv = fakeInvoiceService.createdInvoices.get(0);
        assertThat(inv.getGrandTotal()).isEqualTo(480.0);
        assertThat(inv.getStatus()).isEqualTo("Paid");
    }

    // =========================================================================
    // 6. FAILED VERIFICATION HANDLING
    // =========================================================================

    @Test
    @DisplayName("Negative Test: Invalid signature marks order as FAILED")
    void testVerifyPayment_InvalidSignatureMarksOrderFailed() {
        String orderId = "order_fail_1";
        PaymentOrder order = new PaymentOrder(orderId, "KIS-1", "A", "9", 100.0, "BUY", "prod", "rcpt_fail");
        ordersDatabase.put(orderId, order);

        PaymentVerifyRequest req = new PaymentVerifyRequest();
        req.setRazorpayOrderId(orderId);
        req.setRazorpayPaymentId("pay_fraud");
        req.setRazorpaySignature("invalid_forged_signature_123");

        Map<String, Object> result = paymentService.verifyPayment(req);

        assertThat(result.get("success")).isEqualTo(false);
        assertThat((String) result.get("message")).contains("failed");
        assertThat(order.getStatus()).isEqualTo("FAILED");

        assertThat(fakeFarmerService.recordedTransactions).isEmpty();
        assertThat(fakeInvoiceService.createdInvoices).isEmpty();
    }

    // =========================================================================
    // 7. INPUT SANITIZATION & OVERSIZED PAYLOAD DEFENSE
    // =========================================================================

    @Test
    @DisplayName("Security Defense: Excessively long strings are safely truncated without SQL/DB overflow")
    void testInputSanitization_OversizedStrings() {
        String veryLongName = "A".repeat(500); // Exceeds 100 char limit
        String veryLongNotes = "B".repeat(2000); // Exceeds 500 char limit

        PaymentOrderRequest req = new PaymentOrderRequest();
        req.setAmount(50.0);
        req.setFarmerName(veryLongName);
        req.setNotes(veryLongNotes);

        Map<String, Object> result = paymentService.createOrder(req);
        assertThat(result).isNotNull();

        String orderId = (String) result.get("orderId");
        PaymentOrder order = ordersDatabase.get(orderId);

        assertThat(order.getFarmerName().length()).isLessThanOrEqualTo(100);
        assertThat(order.getNotes().length()).isLessThanOrEqualTo(500);
    }

    // =========================================================================
    // HELPER CLASSES & METHODS
    // =========================================================================

    private String computeHmacSignature(String orderId, String paymentId, String secret) throws Exception {
        String data = orderId + "|" + paymentId;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (byte b : hash) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    static class FakeFarmerService extends FarmerService {
        final List<KhataTransaction> recordedTransactions = new ArrayList<>();
        @Override
        public KhataTransaction addKhataEntry(String farmerId, KhataTransaction tx) {
            recordedTransactions.add(tx);
            return tx;
        }
    }

    static class FakeInvoiceService extends InvoiceService {
        final List<Invoice> createdInvoices = new ArrayList<>();
        @Override
        public Invoice createInvoice(Invoice invoice) {
            invoice.setId("INV-TEST-" + (createdInvoices.size() + 1));
            createdInvoices.add(invoice);
            return invoice;
        }
    }
}
