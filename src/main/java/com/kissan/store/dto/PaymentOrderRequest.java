package com.kissan.store.dto;

public class PaymentOrderRequest {
    private Double amount; // In Rupees
    private String currency = "INR";
    private String farmerId;
    private String farmerName;
    private String farmerMobile;
    private String farmerVillage;
    private String purpose; // PRODUCT_PURCHASE, KHATA_PAYMENT, POS_BILL
    private String productDetails;
    private String notes;

    public PaymentOrderRequest() {}

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getFarmerId() { return farmerId; }
    public void setFarmerId(String farmerId) { this.farmerId = farmerId; }

    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    public String getFarmerMobile() { return farmerMobile; }
    public void setFarmerMobile(String farmerMobile) { this.farmerMobile = farmerMobile; }

    public String getFarmerVillage() { return farmerVillage; }
    public void setFarmerVillage(String farmerVillage) { this.farmerVillage = farmerVillage; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getProductDetails() { return productDetails; }
    public void setProductDetails(String productDetails) { this.productDetails = productDetails; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
