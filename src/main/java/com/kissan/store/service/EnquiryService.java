package com.kissan.store.service;

import com.kissan.store.model.Enquiry;
import com.kissan.store.repository.EnquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EnquiryService {

    @Autowired
    private EnquiryRepository enquiryRepository;

    public List<Enquiry> getAllEnquiries() {
        try {
            return enquiryRepository.findAllByOrderByDateDesc();
        } catch (Exception e) {
            return enquiryRepository.findAll();
        }
    }

    public Enquiry createEnquiry(Enquiry enquiry) {
        if (enquiry.getId() == null || enquiry.getId().trim().isEmpty()) {
            enquiry.setId("ENQ-" + System.currentTimeMillis());
        }
        if (enquiry.getDate() == null || enquiry.getDate().trim().isEmpty()) {
            enquiry.setDate(LocalDateTime.now().toString().substring(0, 16).replace("T", " "));
        }
        if (enquiry.getStatus() == null || enquiry.getStatus().trim().isEmpty()) {
            enquiry.setStatus("New");
        }
        return enquiryRepository.save(enquiry);
    }

    public Optional<Enquiry> updateStatus(String id, String status) {
        Optional<Enquiry> opt = enquiryRepository.findById(id);
        if (opt.isPresent()) {
            Enquiry e = opt.get();
            e.setStatus(status);
            enquiryRepository.save(e);
            return Optional.of(e);
        }
        return Optional.empty();
    }

    public boolean deleteEnquiry(String id) {
        if (enquiryRepository.existsById(id)) {
            enquiryRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
