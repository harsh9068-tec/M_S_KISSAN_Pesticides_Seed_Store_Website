package com.kissan.store.repository;

import com.kissan.store.model.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, String> {

    Optional<Farmer> findByMobile(String mobile);

    Optional<Farmer> findByIdOrMobile(String id, String mobile);
}
