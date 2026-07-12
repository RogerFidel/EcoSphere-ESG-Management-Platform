package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.ProductEsgProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductEsgProfileRepository extends JpaRepository<ProductEsgProfile, Long> {

    @Query("SELECT p FROM ProductEsgProfile p WHERE " +
           "(:search IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.packagingMaterial) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR p.status = :status)")
    Page<ProductEsgProfile> searchProfiles(@Param("search") String search,
                                           @Param("status") String status,
                                           Pageable pageable);
}
