package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT al FROM AuditLog al WHERE " +
           "(:search IS NULL OR LOWER(al.username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(al.action) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(al.details) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<AuditLog> searchLogs(@Param("search") String search, Pageable pageable);
}
