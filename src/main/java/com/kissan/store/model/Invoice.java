package com.kissan.store.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    private String id; // INV-2026-001

    private String date;

    private String time;

    private String farmerId;

    private String farmerName;

    private String farmerMobile;

    private String farmerVillage;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<InvoiceItem> items = new ArrayList<>();

    private Double subtotal;

    private Double discount;

    private Double grandTotal;

    private Double paidAmount;

    private Double balanceDue;

    private String paymentMode; // Cash, UPI, Khata Credit

    private String status; // Paid, Due

    @Column(length = 500)
    private String notes;

    public Invoice() {}

    public Invoice(String id, String date, String time, String farmerId, String farmerName, String farmerMobile,
                   String farmerVillage, Double subtotal, Double discount, Double grandTotal, Double paidAmount,
                   Double balanceDue, String paymentMode, String status, String notes) {
        this.id = id;
        this.date = date;
        this.time = time;
        this.farmerId = farmerId;
        this.farmerName = farmerName;
        this.farmerMobile = farmerMobile;
        this.farmerVillage = farmerVillage;
        this.subtotal = subtotal;
        this.discount = discount;
        this.grandTotal = grandTotal;
        this.paidAmount = paidAmount;
        this.balanceDue = balanceDue;
        this.paymentMode = paymentMode;
        this.status = status;
        this.notes = notes;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getFarmerId() { return farmerId; }
    public void setFarmerId(String farmerId) { this.farmerId = farmerId; }

    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    public String getFarmerMobile() { return farmerMobile; }
    public void setFarmerMobile(String farmerMobile) { this.farmerMobile = farmerMobile; }

    public String getFarmerVillage() { return farmerVillage; }
    public void setFarmerVillage(String farmerVillage) { this.farmerVillage = farmerVillage; }

    public List<InvoiceItem> getItems() { return items; }
    public void setItems(List<InvoiceItem> items) { this.items = items; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }

    public Double getGrandTotal() { return grandTotal; }
    public void setGrandTotal(Double grandTotal) { this.grandTotal = grandTotal; }

    public Double getPaidAmount() { return paidAmount; }
    public void setPaidAmount(Double paidAmount) { this.paidAmount = paidAmount; }

    public Double getBalanceDue() { return balanceDue; }
    public void setBalanceDue(Double balanceDue) { this.balanceDue = balanceDue; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
