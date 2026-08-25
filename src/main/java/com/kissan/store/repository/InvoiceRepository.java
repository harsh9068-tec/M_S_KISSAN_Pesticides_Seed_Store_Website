package com.kissan.store.repository;

import com.kissan.store.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {

    List<Invoice> findByFarmerIdOrderByDateDesc(String farmerId);

    List<Invoice> findAllByOrderByDateDesc();
}
