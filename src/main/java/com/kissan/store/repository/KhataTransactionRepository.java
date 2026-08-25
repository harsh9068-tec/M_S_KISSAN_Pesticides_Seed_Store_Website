package com.kissan.store.repository;

import com.kissan.store.model.KhataTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KhataTransactionRepository extends JpaRepository<KhataTransaction, String> {

    List<KhataTransaction> findByFarmerIdOrderByDateDesc(String farmerId);
}
