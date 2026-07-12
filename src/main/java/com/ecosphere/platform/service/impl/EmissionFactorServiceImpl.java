package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.entity.EmissionFactor;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.EmissionFactorRepository;
import com.ecosphere.platform.service.EmissionFactorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmissionFactorServiceImpl implements EmissionFactorService {

    @Autowired
    private EmissionFactorRepository emissionFactorRepository;

    @Override
    @Transactional
    public EmissionFactor createEmissionFactor(EmissionFactor factor) {
        return emissionFactorRepository.save(factor);
    }

    @Override
    @Transactional
    public EmissionFactor updateEmissionFactor(Long id, EmissionFactor factor) {
        EmissionFactor existing = getEmissionFactorById(id);
        existing.setName(factor.getName());
        existing.setValue(factor.getValue());
        existing.setUnit(factor.getUnit());
        existing.setActivityType(factor.getActivityType());
        existing.setStatus(factor.getStatus());
        return emissionFactorRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public EmissionFactor getEmissionFactorById(Long id) {
        return emissionFactorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emission factor not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmissionFactor> getEmissionFactors(String search, String activityType, String status, Pageable pageable) {
        return emissionFactorRepository.searchEmissionFactors(search, activityType, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmissionFactor> getAllEmissionFactors() {
        return emissionFactorRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteEmissionFactor(Long id) {
        EmissionFactor factor = getEmissionFactorById(id);
        emissionFactorRepository.delete(factor);
    }
}
