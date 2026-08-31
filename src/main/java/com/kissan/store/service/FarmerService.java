package com.kissan.store.service;

import com.kissan.store.model.Farmer;
import com.kissan.store.model.KhataTransaction;
import com.kissan.store.repository.FarmerRepository;
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

        // Link transactions back to farmer
        if (farmer.getKhata() != null) {
            for (KhataTransaction tx : farmer.getKhata()) {
                tx.setFarmer(farmer);
            }
        }

        return farmerRepository.save(farmer);
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
