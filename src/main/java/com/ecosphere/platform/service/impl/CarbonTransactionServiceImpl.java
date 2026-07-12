package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.dto.CarbonTransactionDto;
import com.ecosphere.platform.entity.*;
import com.ecosphere.platform.exception.BadRequestException;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.*;
import com.ecosphere.platform.service.CarbonTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class CarbonTransactionServiceImpl implements CarbonTransactionService {

    @Autowired
    private CarbonTransactionRepository carbonTransactionRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmissionFactorRepository emissionFactorRepository;

    @Autowired
    private EsgConfigurationRepository esgConfigurationRepository;

    /**
     * Business Logic: Auto Carbon Calculation
     * When autoEmissionCalculation is enabled, computes emissionValue = consumptionValue × emissionFactor.value
     * Falls back to provided emissionValue if no matching factor is found or auto-calc is disabled.
     */
    @Override
    @Transactional
    public CarbonTransaction createTransaction(CarbonTransactionDto dto) {
        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));

        double emissionValue = dto.getEmissionValue() != null ? dto.getEmissionValue() : 0.0;

        EsgConfiguration config = esgConfigurationRepository.findFirstConfig().orElse(null);
        if (config != null && config.getAutoEmissionCalculation()) {
            EmissionFactor factor = emissionFactorRepository
                    .findByActivityTypeAndStatus(dto.getSourceType(), "ACTIVE")
                    .orElse(null);
            if (factor != null) {
                emissionValue = dto.getConsumptionValue() * factor.getValue();
            } else if (dto.getEmissionValue() == null) {
                throw new BadRequestException(
                        "No active emission factor found for activity type: " + dto.getSourceType()
                        + ". Please provide emissionValue manually.");
            }
        }

        CarbonTransaction transaction = CarbonTransaction.builder()
                .department(department)
                .sourceType(dto.getSourceType())
                .sourceId(dto.getSourceId())
                .consumptionValue(dto.getConsumptionValue())
                .emissionValue(emissionValue)
                .transactionDate(dto.getTransactionDate())
                .build();

        return carbonTransactionRepository.save(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public CarbonTransaction getTransactionById(Long id) {
        return carbonTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carbon transaction not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CarbonTransaction> getTransactions(Long departmentId, String sourceType,
                                                    LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return carbonTransactionRepository.filterTransactions(departmentId, sourceType, startDate, endDate, pageable);
    }

    @Override
    @Transactional
    public void deleteTransaction(Long id) {
        CarbonTransaction tx = getTransactionById(id);
        carbonTransactionRepository.delete(tx);
    }

    @Override
    @Transactional(readOnly = true)
    public Double getDepartmentTotalEmissions(Long departmentId) {
        Double total = carbonTransactionRepository.sumEmissionsByDepartment(departmentId);
        return total != null ? total : 0.0;
    }
}
