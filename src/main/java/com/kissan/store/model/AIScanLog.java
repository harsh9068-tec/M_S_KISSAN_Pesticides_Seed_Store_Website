package com.kissan.store.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ai_scan_logs")
public class AIScanLog {

    @Id
    private String id;

    private String date;

    private String crop;

    private String cropName;

    private String disease;

    private String confidence;

    private String recommendedMedicine;

    private String dosage;

    private String source;

    public AIScanLog() {}

    public AIScanLog(String id, String date, String crop, String cropName, String disease, String confidence, String recommendedMedicine, String dosage, String source) {
        this.id = id;
        this.date = date;
        this.crop = crop;
        this.cropName = cropName;
        this.disease = disease;
        this.confidence = confidence;
        this.recommendedMedicine = recommendedMedicine;
        this.dosage = dosage;
        this.source = source;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getCrop() { return crop; }
    public void setCrop(String crop) { this.crop = crop; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public String getDisease() { return disease; }
    public void setDisease(String disease) { this.disease = disease; }

    public String getConfidence() { return confidence; }
    public void setConfidence(String confidence) { this.confidence = confidence; }

    public String getRecommendedMedicine() { return recommendedMedicine; }
    public void setRecommendedMedicine(String recommendedMedicine) { this.recommendedMedicine = recommendedMedicine; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
