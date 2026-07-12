package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.EsgPolicy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EsgPolicyRepository extends JpaRepository<EsgPolicy, Long> {

    @Query("SELECT p FROM EsgPolicy p WHERE " +
           "(:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR p.status = :status)")
    Page<EsgPolicy> searchPolicies(@Param("search") String search,
                                   @Param("status") String status,
                                   Pageable pageable);
}
