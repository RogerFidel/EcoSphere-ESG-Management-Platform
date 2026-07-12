package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.CsrActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface CsrActivityRepository extends JpaRepository<CsrActivity, Long> {

    @Query("SELECT ca FROM CsrActivity ca WHERE " +
           "(:search IS NULL OR LOWER(ca.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(ca.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:categoryId IS NULL OR ca.category.id = :categoryId) AND " +
           "(:status IS NULL OR ca.status = :status) AND " +
           "(cast(:startDate as date) IS NULL OR ca.startDate >= :startDate) AND " +
           "(cast(:endDate as date) IS NULL OR ca.endDate <= :endDate)")
    Page<CsrActivity> filterActivities(@Param("search") String search,
                                       @Param("categoryId") Long categoryId,
                                       @Param("status") String status,
                                       @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate,
                                       Pageable pageable);
}
