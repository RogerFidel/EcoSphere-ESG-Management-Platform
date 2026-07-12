package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.entity.ProductEsgProfile;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.ProductEsgProfileRepository;
import com.ecosphere.platform.service.ProductEsgProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductEsgProfileServiceImpl implements ProductEsgProfileService {

    @Autowired
    private ProductEsgProfileRepository productEsgProfileRepository;

    @Override
    @Transactional
    public ProductEsgProfile createProfile(ProductEsgProfile profile) {
        return productEsgProfileRepository.save(profile);
    }

    @Override
    @Transactional
    public ProductEsgProfile updateProfile(Long id, ProductEsgProfile profile) {
        ProductEsgProfile existing = getProfileById(id);
        existing.setProductName(profile.getProductName());
        existing.setCarbonFootprint(profile.getCarbonFootprint());
        existing.setRecyclingPercentage(profile.getRecyclingPercentage());
        existing.setPackagingMaterial(profile.getPackagingMaterial());
        existing.setWaterUsage(profile.getWaterUsage());
        existing.setStatus(profile.getStatus());
        return productEsgProfileRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductEsgProfile getProfileById(Long id) {
        return productEsgProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product ESG profile not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductEsgProfile> getProfiles(String search, String status, Pageable pageable) {
        return productEsgProfileRepository.searchProfiles(search, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductEsgProfile> getAllProfiles() {
        return productEsgProfileRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteProfile(Long id) {
        ProductEsgProfile profile = getProfileById(id);
        productEsgProfileRepository.delete(profile);
    }
}
