package com.kissan.store.repository;

import com.kissan.store.model.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    Optional<PaymentOrder> findByOrderId(String orderId);
    Optional<PaymentOrder> findByPaymentId(String paymentId);
    List<PaymentOrder> findByFarmerIdOrderByCreatedAtDesc(String farmerId);
    List<PaymentOrder> findByFarmerMobileOrderByCreatedAtDesc(String farmerMobile);
    List<PaymentOrder> findAllByOrderByCreatedAtDesc();
}
