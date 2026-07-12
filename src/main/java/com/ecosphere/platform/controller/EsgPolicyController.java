package com.ecosphere.platform.controller;

import com.ecosphere.platform.entity.EsgPolicy;
import com.ecosphere.platform.entity.PolicyAcknowledgement;
import com.ecosphere.platform.service.EsgPolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/esg-policies")
@Tag(name = "ESG Policies", description = "Master data: governance policies and employee acknowledgements")
public class EsgPolicyController {

    @Autowired private EsgPolicyService esgPolicyService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new ESG policy")
    public ResponseEntity<EsgPolicy> create(@RequestBody EsgPolicy policy) {
        return ResponseEntity.ok(esgPolicyService.createPolicy(policy));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an ESG policy")
    public ResponseEntity<EsgPolicy> update(@PathVariable Long id, @RequestBody EsgPolicy policy) {
        return ResponseEntity.ok(esgPolicyService.updatePolicy(id, policy));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an ESG policy by ID")
    public ResponseEntity<EsgPolicy> getById(@PathVariable Long id) {
        return ResponseEntity.ok(esgPolicyService.getPolicyById(id));
    }

    @GetMapping
    @Operation(summary = "Search ESG policies with pagination")
    public ResponseEntity<Page<EsgPolicy>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "effectiveDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(esgPolicyService.getPolicies(search, status, PageRequest.of(page, size, sort)));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all ESG policies")
    public ResponseEntity<List<EsgPolicy>> getAll() {
        return ResponseEntity.ok(esgPolicyService.getAllPolicies());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an ESG policy")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        esgPolicyService.deletePolicy(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{policyId}/acknowledge")
    @Operation(summary = "Acknowledge an ESG policy (Employee)")
    public ResponseEntity<PolicyAcknowledgement> acknowledge(@PathVariable Long policyId, Authentication auth) {
        return ResponseEntity.ok(esgPolicyService.acknowledgePolicy(policyId, auth.getName()));
    }

    @GetMapping("/{policyId}/acknowledge/status")
    @Operation(summary = "Check if current user has acknowledged a policy")
    public ResponseEntity<Map<String, Boolean>> checkAcknowledgement(@PathVariable Long policyId, Authentication auth) {
        boolean acknowledged = esgPolicyService.hasAcknowledged(policyId, auth.getName());
        return ResponseEntity.ok(Map.of("acknowledged", acknowledged));
    }

    @GetMapping("/acknowledgements")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Get all policy acknowledgements with filtering")
    public ResponseEntity<Page<PolicyAcknowledgement>> getAcknowledgements(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long policyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(esgPolicyService.getAcknowledgements(employeeId, policyId, PageRequest.of(page, size)));
    }
}
