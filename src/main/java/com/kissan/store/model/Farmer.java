package com.kissan.store.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "farmers")
public class Farmer {

    @Id
    private String id; // e.g. KIS-1001

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String mobile;

    private String pin;

    private String village;

    private String landSize;

    private String crops;

    private String registeredDate;

    @Column(length = 1000)
    private String notes;

    @OneToMany(mappedBy = "farmer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("date DESC, id DESC")
    private List<KhataTransaction> khata = new ArrayList<>();

    public Farmer() {}

    public Farmer(String id, String name, String mobile, String pin, String village, String landSize, String crops, String registeredDate, String notes) {
        this.id = id;
        this.name = name;
        this.mobile = mobile;
        this.pin = pin;
        this.village = village;
        this.landSize = landSize;
        this.crops = crops;
        this.registeredDate = registeredDate;
        this.notes = notes;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public String getLandSize() { return landSize; }
    public void setLandSize(String landSize) { this.landSize = landSize; }

    public String getCrops() { return crops; }
    public void setCrops(String crops) { this.crops = crops; }

    public String getRegisteredDate() { return registeredDate; }
    public void setRegisteredDate(String registeredDate) { this.registeredDate = registeredDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<KhataTransaction> getKhata() { return khata; }
    public void setKhata(List<KhataTransaction> khata) { this.khata = khata; }
}
