package com.kissan.store.repository;

import com.kissan.store.model.Enquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, String> {

    List<Enquiry> findAllByOrderByDateDesc();
}
