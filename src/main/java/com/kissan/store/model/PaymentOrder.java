package com.kissan.store.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Entity representing an online payment order processed via Payment Gateway (Razorpay/UPI/Cards).
 */
@Entity
@Table(name = "payment_orders")
public class PaymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String orderId; // Razorpay Order ID or Internal Order ID

    @Column(length = 100)
    private String paymentId; // Razorpay Payment ID e.g. pay_29QQoUBcxrhErq

    @Column(length = 255)
    private String signature; // Razorpay Verification HMAC Signature

    @Column(length = 50)
    private String farmerId; // KIS-1001 or Guest

    @Column(length = 100)
    private String farmerName;

    @Column(length = 20)
    private String farmerMobile;

    @Column(nullable = false)
    private Double amount; // In INR Rupees

    @Column(length = 10)
    private String currency = "INR";

    @Column(length = 30)
    private String status; // CREATED, SUCCESS, FAILED, REFUNDED

    @Column(length = 50)
    private String purpose; // PRODUCT_PURCHASE, KHATA_PAYMENT, POS_BILL

    @Column(length = 1000)
    private String productDetails;

    @Column(length = 100)
    private String receipt;

    private String createdAt;

    private String paidAt;

    @Column(length = 500)
    private String notes;

    public PaymentOrder() {
        this.createdAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        this.status = "CREATED";
        this.currency = "INR";
    }

    public PaymentOrder(String orderId, String farmerId, String farmerName, String farmerMobile,
                        Double amount, String purpose, String productDetails, String receipt) {
        this();
        this.orderId = orderId;
        this.farmerId = farmerId;
        this.farmerName = farmerName;
        this.farmerMobile = farmerMobile;
        this.amount = amount;
        this.purpose = purpose;
        this.productDetails = productDetails;
        this.receipt = receipt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }

    public String getFarmerId() { return farmerId; }
    public void setFarmerId(String farmerId) { this.farmerId = farmerId; }

    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    public String getFarmerMobile() { return farmerMobile; }
    public void setFarmerMobile(String farmerMobile) { this.farmerMobile = farmerMobile; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getProductDetails() { return productDetails; }
    public void setProductDetails(String productDetails) { this.productDetails = productDetails; }

    public String getReceipt() { return receipt; }
    public void setReceipt(String receipt) { this.receipt = receipt; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getPaidAt() { return paidAt; }
    public void setPaidAt(String paidAt) { this.paidAt = paidAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
