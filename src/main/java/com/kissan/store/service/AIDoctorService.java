package com.kissan.store.service;

import com.kissan.store.model.AIScanLog;
import com.kissan.store.repository.AIScanLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AIDoctorService {

    @Autowired
    private AIScanLogRepository aiScanLogRepository;

    public static class DiagnosisResult {
        public String crop;
        public String diseaseEn;
        public String diseaseHi;
        public String confidence;
        public String recommendedProduct;
        public String dosage;
        public String sprayAdvice;
    }

    public DiagnosisResult diagnoseCrop(String crop, String symptoms) {
        DiagnosisResult result = new DiagnosisResult();
        String c = crop != null ? crop.toLowerCase() : "general";
        String s = symptoms != null ? symptoms.toLowerCase() : "";

        if (c.contains("sugarcane") || c.contains("ganna")) {
            if (s.contains("red") || s.contains("rot") || s.contains("laal")) {
                result.crop = "Sugarcane (गन्ना)";
                result.diseaseEn = "Red Rot Disease (Colletotrichum falcatum)";
                result.diseaseHi = "लाल सड़न रोग (रेड रॉट)";
                result.confidence = "98%";
                result.recommendedProduct = "Coromandel Benfil / Bavistin (Carbendazim 50% WP)";
                result.dosage = "2 gm per Litre water or 400 gm per acre";
                result.sprayAdvice = "Drench the root zone, remove infected clumps, and treat seed sets before planting.";
            } else {
                result.crop = "Sugarcane (गन्ना)";
                result.diseaseEn = "Early Shoot Borer / Top Borer (Chilo infuscatellus)";
                result.diseaseHi = "कंसुआ / चोटी बेधक कीट";
                result.confidence = "96%";
                result.recommendedProduct = "Syngenta Incipio / DuPont Coragen (Chlorantraniliprole 18.5% SC)";
                result.dosage = "60 ml per acre in 200 Litre water";
                result.sprayAdvice = "Apply directed spray at the base of sugarcane shoots during 35-45 days after planting.";
            }
        } else if (c.contains("wheat") || c.contains("gehu")) {
            result.crop = "Wheat (गेहूं)";
            result.diseaseEn = "Yellow Rust / Stripe Rust (Puccinia striiformis)";
            result.diseaseHi = "पीला रतुआ / हल्दी रोग";
            result.confidence = "97%";
            result.recommendedProduct = "Syngenta Tilt (Propiconazole 25% EC) / Custodia";
            result.dosage = "200 ml per acre in 200 Litre water";
            result.sprayAdvice = "Spray immediately on appearance of yellow powder pustules on leaves.";
        } else {
            result.crop = "General Crop / Vegetable";
            result.diseaseEn = "Leaf Blight & Fungal Leaf Spot";
            result.diseaseHi = "झुलसा रोग एवं फफूंद धब्बा";
            result.confidence = "94%";
            result.recommendedProduct = "Syngenta Kavach Flo / DuPont Curzate / Amistar Top";
            result.dosage = "2 ml per Litre water";
            result.sprayAdvice = "Spray during cool evening hours ensuring uniform coverage of leaf underside.";
        }

        // Log scan
        try {
            AIScanLog log = new AIScanLog(
                    "scan_" + System.currentTimeMillis(),
                    LocalDateTime.now().toString(),
                    c,
                    result.crop,
                    result.diseaseEn,
                    result.confidence,
                    result.recommendedProduct,
                    result.dosage,
                    "Spring Boot AI Engine"
            );
            aiScanLogRepository.save(log);
        } catch (Exception e) {}

        return result;
    }

    public List<AIScanLog> getAllScanLogs() {
        return aiScanLogRepository.findAllByOrderByDateDesc();
    }
}
