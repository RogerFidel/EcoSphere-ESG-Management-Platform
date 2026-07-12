package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.Audit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface AuditRepository extends JpaRepository<Audit, Long> {

    @Query("SELECT a FROM Audit a WHERE " +
           "(:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.auditorName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(cast(:startDate as date) IS NULL OR a.auditDate >= :startDate) AND " +
           "(cast(:endDate as date) IS NULL OR a.auditDate <= :endDate)")
    Page<Audit> filterAudits(@Param("search") String search,
                             @Param("status") String status,
                             @Param("startDate") LocalDate startDate,
                             @Param("endDate") LocalDate endDate,
                             Pageable pageable);
}
