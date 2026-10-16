package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.BillingInvoice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingInvoiceRepository extends JpaRepository<BillingInvoice, String> {}
