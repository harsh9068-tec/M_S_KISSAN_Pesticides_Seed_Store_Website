package com.kissan.store.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "brand")
    private String brand;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "crops", length = 1000)
    private String crops;

    @Column(name = "target", length = 2000)
    private String target;

    @Column(name = "dosage")
    private String dosage;

    @Column(name = "pack_sizes")
    private String packSizes;

    @Column(name = "price")
    private Double price = 0.0;

    @Column(name = "icon")
    private String icon = "🌱";

    @Lob
    @Column(name = "image", columnDefinition = "CLOB")
    private String image;

    @Column(name = "in_stock")
    private Boolean inStock = true;

    @Column(name = "featured")
    private Boolean featured = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Product() {}

    public Product(String id, String name, String brand, String category, String crops, String target, String dosage, String packSizes, String icon, boolean inStock, boolean featured) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.category = category;
        this.crops = crops;
        this.target = target;
        this.dosage = dosage;
        this.packSizes = packSizes;
        this.icon = icon;
        this.inStock = inStock;
        this.featured = featured;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCrops() { return crops; }
    public void setCrops(String crops) { this.crops = crops; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getPackSizes() { return packSizes; }
    public void setPackSizes(String packSizes) { this.packSizes = packSizes; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Boolean getInStock() { return inStock; }
    public void setInStock(Boolean inStock) { this.inStock = inStock; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
