package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.entity.*;
import com.ecosphere.platform.exception.BadRequestException;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.*;
import com.ecosphere.platform.service.AuditService;
import com.ecosphere.platform.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AuditServiceImpl implements AuditService {

    @Autowired
    private AuditRepository auditRepository;

    @Autowired
    private ComplianceIssueRepository complianceIssueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public Audit createAudit(Audit audit) {
        return auditRepository.save(audit);
    }

    @Override
    @Transactional
    public Audit updateAudit(Long id, Audit audit) {
        Audit existing = getAuditById(id);
        existing.setTitle(audit.getTitle());
        existing.setDescription(audit.getDescription());
        existing.setAuditorName(audit.getAuditorName());
        existing.setAuditDate(audit.getAuditDate());
        existing.setScore(audit.getScore());
        existing.setStatus(audit.getStatus());
        return auditRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public Audit getAuditById(Long id) {
        return auditRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Audit> getAudits(String search, String status, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return auditRepository.filterAudits(search, status, startDate, endDate, pageable);
    }

    @Override
    @Transactional
    public void deleteAudit(Long id) {
        Audit audit = getAuditById(id);
        auditRepository.delete(audit);
    }

    @Override
    @Transactional
    public ComplianceIssue createComplianceIssue(ComplianceIssue issue) {
        User owner = userRepository.findById(issue.getOwner().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner user not found with ID: " + issue.getOwner().getId()));

        ComplianceIssue saved = complianceIssueRepository.save(issue);

        notificationService.sendNotification(
                owner.getId(),
                "A new " + issue.getSeverity() + " compliance issue has been assigned to you. Due: " + issue.getDueDate(),
                "COMPLIANCE_ISSUE"
        );

        return saved;
    }

    @Override
    @Transactional
    public ComplianceIssue updateComplianceIssue(Long id, ComplianceIssue issue) {
        ComplianceIssue existing = getComplianceIssueById(id);
        existing.setSeverity(issue.getSeverity());
        existing.setDescription(issue.getDescription());
        existing.setDueDate(issue.getDueDate());
        existing.setStatus(issue.getStatus());
        if (issue.getOwner() != null && issue.getOwner().getId() != null) {
            User newOwner = userRepository.findById(issue.getOwner().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Owner user not found"));
            existing.setOwner(newOwner);
        }
        return complianceIssueRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public ComplianceIssue getComplianceIssueById(Long id) {
        return complianceIssueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compliance issue not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ComplianceIssue> getComplianceIssues(Long auditId, Long ownerId, String severity,
                                                      String status, LocalDate dueDate, Pageable pageable) {
        return complianceIssueRepository.filterIssues(auditId, ownerId, severity, status, dueDate, pageable);
    }

    @Override
    @Transactional
    public void closeComplianceIssue(Long id) {
        ComplianceIssue issue = getComplianceIssueById(id);
        if ("CLOSED".equals(issue.getStatus())) {
            throw new BadRequestException("Issue is already closed");
        }
        issue.setStatus("CLOSED");
        complianceIssueRepository.save(issue);
    }

    @Override
    @Transactional
    public void markOverdueIssues() {
        List<ComplianceIssue> overdueIssues = complianceIssueRepository.findOverdueIssues(LocalDate.now());
        overdueIssues.forEach(issue -> {
            issue.setStatus("OVERDUE");
            complianceIssueRepository.save(issue);
            notificationService.sendNotification(
                    issue.getOwner().getId(),
                    "Compliance issue is now OVERDUE: " + issue.getDescription().substring(0, Math.min(80, issue.getDescription().length())),
                    "COMPLIANCE_ISSUE"
            );
        });
    }
}
