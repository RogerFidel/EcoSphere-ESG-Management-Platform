package com.ecosphere.platform.controller;

import com.ecosphere.platform.entity.Audit;
import com.ecosphere.platform.entity.ComplianceIssue;
import com.ecosphere.platform.service.AuditLogService;
import com.ecosphere.platform.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/audits")
@Tag(name = "Audits & Compliance", description = "Governance audits and compliance issue management")
public class AuditController {

    @Autowired private AuditService auditService;
    @Autowired private AuditLogService auditLogService;

    // ============== AUDIT ENDPOINTS ==============

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new audit record")
    public ResponseEntity<Audit> createAudit(@RequestBody Audit audit, Authentication auth) {
        Audit saved = auditService.createAudit(audit);
        auditLogService.log(auth.getName(), "CREATE_AUDIT", "Audit created: " + saved.getTitle());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an audit record")
    public ResponseEntity<Audit> updateAudit(@PathVariable Long id, @RequestBody Audit audit, Authentication auth) {
        Audit updated = auditService.updateAudit(id, audit);
        auditLogService.log(auth.getName(), "UPDATE_AUDIT", "Audit updated: " + updated.getTitle());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an audit by ID")
    public ResponseEntity<Audit> getAuditById(@PathVariable Long id) {
        return ResponseEntity.ok(auditService.getAuditById(id));
    }

    @GetMapping
    @Operation(summary = "Filter audits by search, status, and date range")
    public ResponseEntity<Page<Audit>> getAudits(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "auditDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(auditService.getAudits(search, status, startDate, endDate, PageRequest.of(page, size, sort)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an audit")
    public ResponseEntity<Void> deleteAudit(@PathVariable Long id) {
        auditService.deleteAudit(id);
        return ResponseEntity.noContent().build();
    }

    // ============== COMPLIANCE ISSUE ENDPOINTS ==============

    @PostMapping("/compliance-issues")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Create a compliance issue (notifies assigned owner)")
    public ResponseEntity<ComplianceIssue> createIssue(@RequestBody ComplianceIssue issue, Authentication auth) {
        ComplianceIssue saved = auditService.createComplianceIssue(issue);
        auditLogService.log(auth.getName(), "CREATE_COMPLIANCE_ISSUE", "Issue created with severity: " + saved.getSeverity());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/compliance-issues/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update a compliance issue")
    public ResponseEntity<ComplianceIssue> updateIssue(@PathVariable Long id, @RequestBody ComplianceIssue issue) {
        return ResponseEntity.ok(auditService.updateComplianceIssue(id, issue));
    }

    @GetMapping("/compliance-issues/{id}")
    @Operation(summary = "Get a compliance issue by ID")
    public ResponseEntity<ComplianceIssue> getIssueById(@PathVariable Long id) {
        return ResponseEntity.ok(auditService.getComplianceIssueById(id));
    }

    @GetMapping("/compliance-issues")
    @Operation(summary = "Filter compliance issues by audit, owner, severity, status, and due date")
    public ResponseEntity<Page<ComplianceIssue>> getIssues(
            @RequestParam(required = false) Long auditId,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(auditService.getComplianceIssues(auditId, ownerId, severity, status, dueDate, PageRequest.of(page, size, sort)));
    }

    @PatchMapping("/compliance-issues/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Close a compliance issue")
    public ResponseEntity<Void> closeIssue(@PathVariable Long id, Authentication auth) {
        auditService.closeComplianceIssue(id);
        auditLogService.log(auth.getName(), "CLOSE_COMPLIANCE_ISSUE", "Issue closed with ID: " + id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/compliance-issues/mark-overdue")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mark all overdue open issues (scheduled job trigger)")
    public ResponseEntity<Void> markOverdue() {
        auditService.markOverdueIssues();
        return ResponseEntity.noContent().build();
    }
}
