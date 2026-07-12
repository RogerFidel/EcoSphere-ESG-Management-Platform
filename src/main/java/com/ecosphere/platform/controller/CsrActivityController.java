package com.ecosphere.platform.controller;

import com.ecosphere.platform.entity.CsrActivity;
import com.ecosphere.platform.entity.EmployeeParticipation;
import com.ecosphere.platform.service.CsrActivityService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/csr-activities")
@Tag(name = "CSR Activities", description = "Transactional: corporate social responsibility activities and employee participation")
public class CsrActivityController {

    @Autowired private CsrActivityService csrActivityService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Create a new CSR activity")
    public ResponseEntity<CsrActivity> create(@RequestBody CsrActivity activity) {
        return ResponseEntity.ok(csrActivityService.createActivity(activity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update a CSR activity")
    public ResponseEntity<CsrActivity> update(@PathVariable Long id, @RequestBody CsrActivity activity) {
        return ResponseEntity.ok(csrActivityService.updateActivity(id, activity));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a CSR activity by ID")
    public ResponseEntity<CsrActivity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(csrActivityService.getActivityById(id));
    }

    @GetMapping
    @Operation(summary = "Filter CSR activities by search, category, status, and date range")
    public ResponseEntity<Page<CsrActivity>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(csrActivityService.getActivities(search, categoryId, status, startDate, endDate, PageRequest.of(page, size, sort)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a CSR activity")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        csrActivityService.deleteActivity(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{activityId}/join")
    @Operation(summary = "Join a CSR activity (Employee)")
    public ResponseEntity<EmployeeParticipation> join(
            @PathVariable Long activityId,
            @RequestBody(required = false) Map<String, String> body,
            Authentication auth) {
        String proofUrl = body != null ? body.get("proofFileUrl") : null;
        return ResponseEntity.ok(csrActivityService.joinActivity(activityId, auth.getName(), proofUrl));
    }

    @PatchMapping("/participations/{participationId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Approve or reject a CSR participation")
    public ResponseEntity<EmployeeParticipation> approve(
            @PathVariable Long participationId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        return ResponseEntity.ok(csrActivityService.approveParticipation(participationId, body.get("approvalStatus"), auth.getName()));
    }

    @GetMapping("/participations")
    @Operation(summary = "Get participations with filtering by employee, activity, and status")
    public ResponseEntity<Page<EmployeeParticipation>> getParticipations(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long activityId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(csrActivityService.getParticipations(employeeId, activityId, status, PageRequest.of(page, size)));
    }
}
