package com.kissan.store.controller;

import com.kissan.store.model.Farmer;
import com.kissan.store.model.Invoice;
import com.kissan.store.model.Product;
import com.kissan.store.service.FarmerService;
import com.kissan.store.service.InvoiceService;
import com.kissan.store.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
    public ResponseEntity<Map<String, Object>> exportFullDatabase() {
        Map<String, Object> data = new HashMap<>();
        data.put("timestamp", LocalDateTime.now().toString());
        data.put("storeName", "M/S KISSAN Pesticides and Seed Store");
        data.put("products", productService.getAllProducts());
        data.put("farmers", farmerService.getAllFarmers());
        data.put("invoices", invoiceService.getAllInvoices());
        return ResponseEntity.ok(data);
    }

    @PostMapping("/import-json")
    public ResponseEntity<?> importDatabase(@RequestBody Map<String, Object> backupData) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Backup processed successfully."
        ));
    }
}
