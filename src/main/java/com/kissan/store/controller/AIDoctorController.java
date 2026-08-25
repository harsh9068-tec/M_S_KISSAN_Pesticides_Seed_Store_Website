package com.kissan.store.controller;

import com.kissan.store.model.AIScanLog;
import com.kissan.store.service.AIDoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai-doctor")
@CrossOrigin(origins = "*")
public class AIDoctorController {

    @Autowired
    private AIDoctorService aiDoctorService;

    @PostMapping("/diagnose")
    public ResponseEntity<AIDoctorService.DiagnosisResult> diagnose(@RequestBody Map<String, String> body) {
        String crop = body.get("crop");
        String symptoms = body.get("symptoms");
        return ResponseEntity.ok(aiDoctorService.diagnoseCrop(crop, symptoms));
    }

    @GetMapping("/scans")
    public ResponseEntity<List<AIScanLog>> getAllScans() {
        return ResponseEntity.ok(aiDoctorService.getAllScanLogs());
    }
}
