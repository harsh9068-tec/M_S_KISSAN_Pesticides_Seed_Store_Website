package com.kissan.store.service;

import com.kissan.store.model.Farmer;
import com.kissan.store.model.KhataTransaction;
import com.kissan.store.repository.FarmerRepository;
import com.kissan.store.repository.KhataTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class FarmerService {

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private KhataTransactionRepository khataRepository;

    public List<Farmer> getAllFarmers() {
        return farmerRepository.findAll();
    }

    public Optional<Farmer> getFarmerByIdOrMobile(String idOrMobile) {
        String clean = idOrMobile.trim();
        Optional<Farmer> byId = farmerRepository.findById(clean);
        if (byId.isPresent()) return byId;
        return farmerRepository.findByMobile(clean);
    }

    @Transactional
    public Farmer registerOrSaveFarmer(Farmer farmer) {
        if (farmer.getId() == null || farmer.getId().trim().isEmpty()) {
            long count = farmerRepository.count();
            farmer.setId("KIS-" + (1001 + count));
        }
        if (farmer.getRegisteredDate() == null || farmer.getRegisteredDate().isEmpty()) {
            farmer.setRegisteredDate(LocalDate.now().toString());
        }

        // If password is set, keep pin synced or vice-versa
        if (farmer.getPassword() != null && !farmer.getPassword().trim().isEmpty()) {
            if (farmer.getPin() == null || farmer.getPin().trim().isEmpty()) {
                farmer.setPin(farmer.getPassword());
            }
        } else if (farmer.getPin() != null && !farmer.getPin().trim().isEmpty()) {
            farmer.setPassword(farmer.getPin());
        } else {
            // Default password to last 4 digits of mobile or 1234
            String defPass = farmer.getMobile() != null && farmer.getMobile().length() >= 4 
                    ? farmer.getMobile().substring(farmer.getMobile().length() - 4) 
                    : "1234";
            farmer.setPassword(defPass);
            farmer.setPin(defPass);
        }

        // Link transactions back to farmer
        if (farmer.getKhata() != null) {
            for (KhataTransaction tx : farmer.getKhata()) {
                tx.setFarmer(farmer);
            }
        }

        return farmerRepository.save(farmer);
    }

    @Transactional
    public Farmer updateFarmer(String id, Farmer updated) {
        Optional<Farmer> existingOpt = farmerRepository.findById(id);
        if (existingOpt.isEmpty()) {
            throw new IllegalArgumentException("Farmer with ID " + id + " not found.");
        }
        Farmer existing = existingOpt.get();

        if (updated.getName() != null) existing.setName(updated.getName().trim());
        if (updated.getMobile() != null) existing.setMobile(updated.getMobile().trim());
        if (updated.getVillage() != null) existing.setVillage(updated.getVillage().trim());
        if (updated.getLandSize() != null) existing.setLandSize(updated.getLandSize().trim());
        if (updated.getCrops() != null) existing.setCrops(updated.getCrops().trim());
        if (updated.getNotes() != null) existing.setNotes(updated.getNotes().trim());
        if (updated.getPassword() != null && !updated.getPassword().trim().isEmpty()) {
            existing.setPassword(updated.getPassword().trim());
            existing.setPin(updated.getPassword().trim());
        } else if (updated.getPin() != null && !updated.getPin().trim().isEmpty()) {
            existing.setPin(updated.getPin().trim());
            existing.setPassword(updated.getPin().trim());
        }

        return farmerRepository.save(existing);
    }

    public Optional<Farmer> loginWithPassword(String mobileOrId, String password) {
        if (mobileOrId == null || password == null) return Optional.empty();
        Optional<Farmer> farmerOpt = getFarmerByIdOrMobile(mobileOrId);
        if (farmerOpt.isEmpty()) return Optional.empty();

        Farmer farmer = farmerOpt.get();
        String cleanPassword = password.trim();

        // Check password or pin match (supporting both for seamless access)
        boolean passwordMatches = (farmer.getPassword() != null && farmer.getPassword().trim().equals(cleanPassword))
                || (farmer.getPin() != null && farmer.getPin().trim().equals(cleanPassword));

        return passwordMatches ? Optional.of(farmer) : Optional.empty();
    }

    @Transactional
    public boolean resetPassword(String farmerIdOrMobile, String newPassword) {
        Optional<Farmer> farmerOpt = getFarmerByIdOrMobile(farmerIdOrMobile);
        if (farmerOpt.isEmpty()) return false;

        Farmer farmer = farmerOpt.get();
        farmer.setPassword(newPassword.trim());
        farmer.setPin(newPassword.trim());
        farmerRepository.save(farmer);
        return true;
    }

    @Transactional
    public KhataTransaction addKhataEntry(String farmerId, KhataTransaction tx) {
        Optional<Farmer> farmerOpt = farmerRepository.findById(farmerId);
        if (farmerOpt.isEmpty()) {
            throw new IllegalArgumentException("Farmer with ID " + farmerId + " not found.");
        }

        Farmer farmer = farmerOpt.get();
        if (tx.getId() == null || tx.getId().isEmpty()) {
            tx.setId("tx_" + System.currentTimeMillis());
        }
        if (tx.getDate() == null || tx.getDate().isEmpty()) {
            tx.setDate(LocalDate.now().toString());
        }
        if (tx.getBalance() == null) {
            double amt = tx.getAmount() != null ? tx.getAmount() : 0.0;
            double paid = tx.getPaid() != null ? tx.getPaid() : 0.0;
            tx.setBalance(amt - paid);
        }
        tx.setFarmer(farmer);
        farmer.getKhata().add(0, tx);
        farmerRepository.save(farmer);
        return tx;
    }

    public void deleteFarmer(String id) {
        farmerRepository.deleteById(id);
    }
}
