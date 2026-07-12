package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.EmissionFactor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {

    Optional<EmissionFactor> findByActivityTypeAndStatus(String activityType, String status);

    @Query("SELECT e FROM EmissionFactor e WHERE " +
           "(:search IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:activityType IS NULL OR e.activityType = :activityType) AND " +
           "(:status IS NULL OR e.status = :status)")
    Page<EmissionFactor> searchEmissionFactors(@Param("search") String search,
                                               @Param("activityType") String activityType,
                                               @Param("status") String status,
                                               Pageable pageable);
}
