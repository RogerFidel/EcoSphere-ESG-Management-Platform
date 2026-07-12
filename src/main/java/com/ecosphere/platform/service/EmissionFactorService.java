package com.ecosphere.platform.service;

import com.ecosphere.platform.entity.EmissionFactor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmissionFactorService {
    EmissionFactor createEmissionFactor(EmissionFactor factor);
    EmissionFactor updateEmissionFactor(Long id, EmissionFactor factor);
    EmissionFactor getEmissionFactorById(Long id);
    Page<EmissionFactor> getEmissionFactors(String search, String activityType, String status, Pageable pageable);
    List<EmissionFactor> getAllEmissionFactors();
    void deleteEmissionFactor(Long id);
}
