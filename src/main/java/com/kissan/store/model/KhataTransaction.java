package com.kissan.store.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "khata_transactions")
public class KhataTransaction {

    @Id
    private String id; // tx_123456789

    private String date;

    private String type; // purchase, payment, credit

    @Column(length = 500)
    private String product;

    private String qty;

    private Double amount;

    private Double paid;

    private Double balance;

    @Column(length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id")
    @JsonIgnore
    private Farmer farmer;

    public KhataTransaction() {}

    public KhataTransaction(String id, String date, String type, String product, String qty, Double amount, Double paid, Double balance, String notes, Farmer farmer) {
        this.id = id;
        this.date = date;
        this.type = type;
        this.product = product;
        this.qty = qty;
        this.amount = amount;
        this.paid = paid;
        this.balance = balance;
        this.notes = notes;
        this.farmer = farmer;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getProduct() { return product; }
    public void setProduct(String product) { this.product = product; }

    public String getQty() { return qty; }
    public void setQty(String qty) { this.qty = qty; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public Double getPaid() { return paid; }
    public void setPaid(Double paid) { this.paid = paid; }

    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Farmer getFarmer() { return farmer; }
    public void setFarmer(Farmer farmer) { this.farmer = farmer; }
}
