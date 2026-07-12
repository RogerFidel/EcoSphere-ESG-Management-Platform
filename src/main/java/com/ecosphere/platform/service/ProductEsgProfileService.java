package com.ecosphere.platform.service;

import com.ecosphere.platform.entity.ProductEsgProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductEsgProfileService {
    ProductEsgProfile createProfile(ProductEsgProfile profile);
    ProductEsgProfile updateProfile(Long id, ProductEsgProfile profile);
    ProductEsgProfile getProfileById(Long id);
    Page<ProductEsgProfile> getProfiles(String search, String status, Pageable pageable);
    List<ProductEsgProfile> getAllProfiles();
    void deleteProfile(Long id);
}
