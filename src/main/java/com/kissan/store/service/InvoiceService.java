package com.kissan.store.service;

import com.kissan.store.model.Invoice;
import com.kissan.store.model.InvoiceItem;
import com.kissan.store.model.KhataTransaction;
import com.kissan.store.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private FarmerService farmerService;

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAllByOrderByDateDesc();
    }

    public Optional<Invoice> getInvoiceById(String id) {
        return invoiceRepository.findById(id);
    }

    public List<Invoice> getInvoicesByFarmerId(String farmerId) {
        return invoiceRepository.findByFarmerIdOrderByDateDesc(farmerId);
    }

    @Transactional
    public Invoice createInvoice(Invoice invoice) {
        if (invoice.getId() == null || invoice.getId().trim().isEmpty()) {
            long count = invoiceRepository.count();
            int year = LocalDate.now().getYear();
            invoice.setId(String.format("INV-%d-%03d", year, count + 1));
        }

        if (invoice.getDate() == null || invoice.getDate().isEmpty()) {
            invoice.setDate(LocalDate.now().toString());
        }

        if (invoice.getTime() == null || invoice.getTime().isEmpty()) {
            invoice.setTime(LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a")));
        }

        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                item.setInvoice(invoice);
            }
        }

        double grandTotal = invoice.getGrandTotal() != null ? invoice.getGrandTotal() : 0.0;
        double paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0;
        invoice.setBalanceDue(grandTotal - paidAmount);
        invoice.setStatus(paidAmount >= grandTotal ? "Paid" : "Due");

        Invoice saved = invoiceRepository.save(invoice);

        // Auto-link to Farmer Khata if registered
        if (saved.getFarmerId() != null && saved.getFarmerId().startsWith("KIS-")) {
            try {
                KhataTransaction tx = new KhataTransaction(
                        "tx_" + System.currentTimeMillis(),
                        saved.getDate(),
                        "purchase",
                        "POS Bill #" + saved.getId() + " (" + (saved.getItems() != null ? saved.getItems().size() : 0) + " items)",
                        "1 Bill",
                        saved.getGrandTotal(),
                        saved.getPaidAmount(),
                        saved.getBalanceDue(),
                        "Payment: " + saved.getPaymentMode(),
                        null
                );
                farmerService.addKhataEntry(saved.getFarmerId(), tx);
            } catch (Exception e) {
                // Handled safely
            }
        }

        return saved;
    }

    public void deleteInvoice(String id) {
        invoiceRepository.deleteById(id);
    }
}
