package com.ecosphere.platform.controller;

import com.ecosphere.platform.entity.EmissionFactor;
import com.ecosphere.platform.service.EmissionFactorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emission-factors")
@Tag(name = "Emission Factors", description = "Master data: carbon emission calculation factors")
public class EmissionFactorController {

    @Autowired private EmissionFactorService emissionFactorService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new emission factor")
    public ResponseEntity<EmissionFactor> create(@RequestBody EmissionFactor factor) {
        return ResponseEntity.ok(emissionFactorService.createEmissionFactor(factor));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an emission factor")
    public ResponseEntity<EmissionFactor> update(@PathVariable Long id, @RequestBody EmissionFactor factor) {
        return ResponseEntity.ok(emissionFactorService.updateEmissionFactor(id, factor));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an emission factor by ID")
    public ResponseEntity<EmissionFactor> getById(@PathVariable Long id) {
        return ResponseEntity.ok(emissionFactorService.getEmissionFactorById(id));
    }

    @GetMapping
    @Operation(summary = "Search emission factors with pagination, filtering by activityType")
    public ResponseEntity<Page<EmissionFactor>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String activityType,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(emissionFactorService.getEmissionFactors(search, activityType, status, PageRequest.of(page, size, sort)));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all emission factors (for dropdowns)")
    public ResponseEntity<List<EmissionFactor>> getAll() {
        return ResponseEntity.ok(emissionFactorService.getAllEmissionFactors());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an emission factor")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        emissionFactorService.deleteEmissionFactor(id);
        return ResponseEntity.noContent().build();
    }
}
