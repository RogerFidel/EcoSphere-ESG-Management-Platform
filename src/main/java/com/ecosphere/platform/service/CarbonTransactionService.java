package com.ecosphere.platform.service;

import com.ecosphere.platform.dto.CarbonTransactionDto;
import com.ecosphere.platform.entity.CarbonTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface CarbonTransactionService {
    CarbonTransaction createTransaction(CarbonTransactionDto dto);
    CarbonTransaction getTransactionById(Long id);
    Page<CarbonTransaction> getTransactions(Long departmentId, String sourceType, LocalDate startDate, LocalDate endDate, Pageable pageable);
    void deleteTransaction(Long id);
    Double getDepartmentTotalEmissions(Long departmentId);
}
