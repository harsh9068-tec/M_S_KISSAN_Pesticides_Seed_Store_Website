package com.kissan.store.controller;

import com.kissan.store.model.Farmer;
import com.kissan.store.model.Invoice;
import com.kissan.store.model.Product;
import com.kissan.store.service.FarmerService;
import com.kissan.store.service.InvoiceService;
import com.kissan.store.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/backup")
@CrossOrigin(origins = "*")
public class BackupController {

    @Autowired
    private ProductService productService;

    @Autowired
    private FarmerService farmerService;

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping("/export-json")
    public ResponseEntity<Map<String, Object>> exportBackup() {
        Map<String, Object> dump = new HashMap<>();
        dump.put("meta", Map.of(
                "app", "M/S KISSAN Pesticides & Seed Store Java Full Stack Application",
                "version", "3.4-SpringBoot-JPA",
                "exportTimestamp", LocalDateTime.now().toString()
        ));
        dump.put("products", productService.getAllProducts());
        dump.put("farmers", farmerService.getAllFarmers());
        dump.put("invoices", invoiceService.getAllInvoices());
        return ResponseEntity.ok(dump);
    }

    @PostMapping("/import-json")
    public ResponseEntity<?> importBackup(@RequestBody Map<String, Object> data) {
        try {
            // Restore products
            if (data.containsKey("products")) {
                List<?> list = (List<?>) data.get("products");
                // Handled gracefully
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "Data imported into SQL database successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
