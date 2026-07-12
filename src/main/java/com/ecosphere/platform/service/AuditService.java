package com.ecosphere.platform.service;

import com.ecosphere.platform.entity.Audit;
import com.ecosphere.platform.entity.ComplianceIssue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface AuditService {
    Audit createAudit(Audit audit);
    Audit updateAudit(Long id, Audit audit);
    Audit getAuditById(Long id);
    Page<Audit> getAudits(String search, String status, LocalDate startDate, LocalDate endDate, Pageable pageable);
    void deleteAudit(Long id);

    ComplianceIssue createComplianceIssue(ComplianceIssue issue);
    ComplianceIssue updateComplianceIssue(Long id, ComplianceIssue issue);
    ComplianceIssue getComplianceIssueById(Long id);
    Page<ComplianceIssue> getComplianceIssues(Long auditId, Long ownerId, String severity, String status, LocalDate dueDate, Pageable pageable);
    void closeComplianceIssue(Long id);
    void markOverdueIssues();
}
