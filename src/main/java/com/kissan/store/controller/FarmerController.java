package com.kissan.store.controller;

import com.kissan.store.model.Farmer;
import com.kissan.store.model.KhataTransaction;
import com.kissan.store.service.FarmerService;
import com.kissan.store.service.OTPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
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

    @PostMapping("/login")
    public ResponseEntity<?> loginWithPassword(@RequestBody Map<String, String> body) {
        String mobileOrId = body.get("mobileOrId");
        if (mobileOrId == null || mobileOrId.trim().isEmpty()) {
            mobileOrId = body.get("phoneOrId");
        }
        String password = body.get("password");
        if (password == null || password.trim().isEmpty()) {
            password = body.get("pin");
        }

        if (mobileOrId == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Mobile/Farmer ID and Password are required."));
        }

        return farmerService.loginWithPassword(mobileOrId, password)
                .map(f -> ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Login successful!",
                        "farmer", f,
                        "token", "kissan_auth_token_" + f.getId()
                )))
                .orElse(ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "Invalid Mobile/Farmer ID or Password."
                )));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String farmerIdOrMobile = body.get("farmerId");
        if (farmerIdOrMobile == null || farmerIdOrMobile.trim().isEmpty()) {
            farmerIdOrMobile = body.get("mobile");
        }
        if (farmerIdOrMobile == null || farmerIdOrMobile.trim().isEmpty()) {
            farmerIdOrMobile = body.get("mobileOrId");
        }
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            newPassword = body.get("password");
        }

        if (farmerIdOrMobile == null || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Farmer ID and new password are required."));
        }

        boolean updated = farmerService.resetPassword(farmerIdOrMobile, newPassword);
        if (updated) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Password updated successfully in database."));
        } else {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Farmer not found."));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Farmer> updateFarmer(@PathVariable String id, @RequestBody Farmer farmer) {
        return ResponseEntity.ok(farmerService.updateFarmer(id, farmer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFarmer(@PathVariable String id) {
        farmerService.deleteFarmer(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login-otp")
    public ResponseEntity<?> verifyFarmerLoginOTP(@RequestBody Map<String, String> body) {
        String phoneOrId = body.get("phoneOrId");
        String code = body.get("code");

        boolean valid = otpService.verifyOTP(phoneOrId, code);
        if (!valid) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid or expired OTP."));
        }

        Farmer farmer = farmerService.getFarmerByIdOrMobile(phoneOrId).orElse(null);
        if (farmer == null) {
            String cleanPhone = phoneOrId.replaceAll("\\D", "");
            String defPass = cleanPhone.length() >= 4 ? cleanPhone.substring(cleanPhone.length() - 4) : "1234";
            farmer = new Farmer(
                    "KIS-" + (System.currentTimeMillis() % 10000),
                    "Farmer " + (phoneOrId.length() >= 4 ? phoneOrId.substring(phoneOrId.length() - 4) : phoneOrId),
                    phoneOrId,
                    defPass,
                    defPass,
                    "Village Behra Sadat",
                    "5 Acres",
                    "Sugarcane, Wheat",
                    LocalDate.now().toString(),
                    "Auto-registered via OTP Portal"
            );
            farmer = farmerService.registerOrSaveFarmer(farmer);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "farmer", farmer,
                "token", "demo-jwt-token-" + farmer.getId()
        ));
    }

    @PostMapping("/{id}/khata")
    public ResponseEntity<KhataTransaction> addKhataTransaction(@PathVariable String id, @RequestBody KhataTransaction tx) {
        return ResponseEntity.ok(farmerService.addKhataEntry(id, tx));
    }
}
