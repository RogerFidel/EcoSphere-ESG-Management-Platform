package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.ComplianceIssue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ComplianceIssueRepository extends JpaRepository<ComplianceIssue, Long> {

    @Query("SELECT ci FROM ComplianceIssue ci WHERE " +
           "(:auditId IS NULL OR ci.audit.id = :auditId) AND " +
           "(:ownerId IS NULL OR ci.owner.id = :ownerId) AND " +
           "(:severity IS NULL OR ci.severity = :severity) AND " +
           "(:status IS NULL OR ci.status = :status) AND " +
           "(cast(:dueDate as date) IS NULL OR ci.dueDate <= :dueDate)")
    Page<ComplianceIssue> filterIssues(@Param("auditId") Long auditId,
                                       @Param("ownerId") Long ownerId,
                                       @Param("severity") String severity,
                                       @Param("status") String status,
                                       @Param("dueDate") LocalDate dueDate,
                                       Pageable pageable);

    @Query("SELECT COUNT(ci) FROM ComplianceIssue ci WHERE ci.owner.department.id = :departmentId AND ci.status IN ('OPEN', 'OVERDUE')")
    Long countOpenIssuesByDepartment(@Param("departmentId") Long departmentId);

    @Query("SELECT ci FROM ComplianceIssue ci WHERE ci.status = 'OPEN' AND ci.dueDate < :today")
    List<ComplianceIssue> findOverdueIssues(@Param("today") LocalDate today);
}
