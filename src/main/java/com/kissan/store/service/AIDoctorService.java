package com.kissan.store.service;

import com.kissan.store.model.AIScanLog;
import com.kissan.store.repository.AIScanLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

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

    public DiagnosisResult diagnose(String crop, String symptomText) {
        DiagnosisResult r = new DiagnosisResult();
        r.crop = (crop != null && !crop.isEmpty()) ? crop : "Sugarcane";
        String s = symptomText != null ? symptomText.toLowerCase() : "";

        if (s.contains("top borer") || s.contains("shoot borer") || s.contains("borer") || s.contains("कीड़ा") || s.contains("सुंडी")) {
            r.diseaseEn = "Top Borer / Shoot Borer Attack";
            r.diseaseHi = "तना छेदक / चोटी छेदक कीट प्रकोप";
            r.confidence = "97%";
            r.recommendedProduct = "DuPont Coragen / Syngenta Incipio";
            r.dosage = "60 ml per acre in 200 Litres water";
            r.sprayAdvice = "Spray at morning/evening. Ensure direct spray reach at shoot funnel.";
        } else if (s.contains("red rot") || s.contains("लाल सड़न") || s.contains("rot")) {
            r.diseaseEn = "Red Rot Disease (Cancer of Sugarcane)";
            r.diseaseHi = "लाल सड़न रोग (गन्ने का कैंसर)";
            r.confidence = "95%";
            r.recommendedProduct = "Coromandel Benfil (Carbendazim 50% WP) + Trichoderma";
            r.dosage = "2 gm / Litre water & drenching at root zone";
            r.sprayAdvice = "Rogue out infected clumps immediately and drench soil.";
        } else if (s.contains("yellow") || s.contains("पीला") || s.contains("growth") || s.contains("chlorosis")) {
            r.diseaseEn = "Zinc / Iron Deficiency & Yellowing";
            r.diseaseHi = "जिंक व सल्फर की कमी से पीलापन";
            r.confidence = "92%";
            r.recommendedProduct = "Triveni Shaktiman Zinc 33% + Agrico Humic King";
            r.dosage = "5 kg/acre basal or 1L Humic King in irrigation";
            r.sprayAdvice = "Apply with early irrigation. Promotes white root development.";
        } else {
            r.diseaseEn = "General Pest & Crop Vigor Protection Needed";
            r.diseaseHi = "सामान्य कीट सुरक्षा व वानस्पतिक वृद्धि टॉनिक";
            r.confidence = "89%";
            r.recommendedProduct = "Syngenta Isabion Bio-Stimulant + Safe-Mida";
            r.dosage = "2 ml / Litre water (Foliar spray)";
            r.sprayAdvice = "Foliar spray after irrigation for rapid greening and tillering.";
        }

        // Save scan log to persistent DB
        try {
            AIScanLog log = new AIScanLog(
                    "SCAN-" + System.currentTimeMillis(),
                    LocalDateTime.now().toString().substring(0, 16).replace("T", " "),
                    r.crop.toLowerCase(),
                    r.crop,
                    r.diseaseEn,
                    r.confidence,
                    r.recommendedProduct,
                    r.dosage,
                    "web_ai_doctor"
            );
            aiScanLogRepository.save(log);
        } catch (Exception ignored) {}

        return r;
    }

    public AIScanLog logScan(AIScanLog log) {
        if (log.getId() == null || log.getId().isEmpty()) {
            log.setId("SCAN-" + System.currentTimeMillis());
        }
        if (log.getDate() == null || log.getDate().isEmpty()) {
            log.setDate(LocalDateTime.now().toString().substring(0, 16).replace("T", " "));
        }
        return aiScanLogRepository.save(log);
    }

    public List<AIScanLog> getAllScanLogs() {
        return aiScanLogRepository.findAll();
    }
}
