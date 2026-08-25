package com.kissan.store.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String brand;

    @Column(nullable = false)
    private String category; // fungicide, insecticide, seed, bio, herbicide, fertilizer

    private String crops;

    @Column(length = 1000)
    private String target;

    private String dosage;

    private String packSizes;

    private Double price;

    private String icon;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String image;

    private Boolean inStock = true;

    private Boolean featured = true;

    public Product() {}

    public Product(String id, String name, String brand, String category, String crops, String target,
                   String dosage, String packSizes, Double price, String icon, String image, Boolean inStock, Boolean featured) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.category = category;
        this.crops = crops;
        this.target = target;
        this.dosage = dosage;
        this.packSizes = packSizes;
        this.price = price;
        this.icon = icon;
        this.image = image;
        this.inStock = inStock != null ? inStock : true;
        this.featured = featured != null ? featured : true;
    }

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
}
