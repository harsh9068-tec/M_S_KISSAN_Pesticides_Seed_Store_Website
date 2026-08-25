package com.kissan.store.model;

import jakarta.persistence.*;

@Entity
@Table(name = "enquiries")
public class Enquiry {

    @Id
    private String id;

    private String date;

    private String name;

    private String phone;

    private String crop;

    @Column(length = 1000)
    private String message;

    private String status; // New, Responded, Closed

    public Enquiry() {}

    public Enquiry(String id, String date, String name, String phone, String crop, String message, String status) {
        this.id = id;
        this.date = date;
        this.name = name;
        this.phone = phone;
        this.crop = crop;
        this.message = message;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCrop() { return crop; }
    public void setCrop(String crop) { this.crop = crop; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
