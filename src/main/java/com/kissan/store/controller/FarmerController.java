package com.kissan.store.controller;

import com.kissan.store.model.Farmer;
import com.kissan.store.model.KhataTransaction;
import com.kissan.store.service.FarmerService;
import com.kissan.store.service.OTPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/farmers")
@CrossOrigin(origins = "*")
public class FarmerController {

    @Autowired
    private FarmerService farmerService;

    @Autowired
    private OTPService otpService;

    @GetMapping
    public ResponseEntity<List<Farmer>> getAllFarmers() {
        return ResponseEntity.ok(farmerService.getAllFarmers());
    }

    @GetMapping("/{idOrMobile}")
    public ResponseEntity<Farmer> getFarmerByIdOrMobile(@PathVariable String idOrMobile) {
        return farmerService.getFarmerByIdOrMobile(idOrMobile)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    public ResponseEntity<Farmer> registerFarmer(@RequestBody Farmer farmer) {
        return ResponseEntity.ok(farmerService.registerOrSaveFarmer(farmer));
    }

    @PostMapping("/login-otp")
    public ResponseEntity<?> loginWithOTP(@RequestBody Map<String, String> body) {
        String mobileOrId = body.get("mobileOrId");
        String otp = body.get("otp");

        if (mobileOrId == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing mobile or OTP."));
        }

        boolean valid = otpService.verifyOTP(mobileOrId, otp);
        if (!valid) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid or expired OTP."));
        }

        Farmer farmer = farmerService.getFarmerByIdOrMobile(mobileOrId).orElseGet(() -> {
            Farmer newF = new Farmer(
                    null,
                    "Farmer (" + mobileOrId.substring(Math.max(0, mobileOrId.length() - 4)) + ")",
                    mobileOrId,
                    "1234",
                    "Village Behra Sadat",
                    "Not Specified",
                    "Sugarcane, Wheat",
                    LocalDate.now().toString(),
                    "Auto-registered via OTP"
            );
            return farmerService.registerOrSaveFarmer(newF);
        });

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("farmer", farmer);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{farmerId}/khata")
    public ResponseEntity<KhataTransaction> addKhataEntry(
            @PathVariable String farmerId,
            @RequestBody KhataTransaction tx) {
        return ResponseEntity.ok(farmerService.addKhataEntry(farmerId, tx));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFarmer(@PathVariable String id) {
        farmerService.deleteFarmer(id);
        return ResponseEntity.noContent().build();
    }
}
