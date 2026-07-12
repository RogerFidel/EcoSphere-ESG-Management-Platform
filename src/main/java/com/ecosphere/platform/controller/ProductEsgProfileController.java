package com.ecosphere.platform.controller;

import com.ecosphere.platform.entity.ProductEsgProfile;
import com.ecosphere.platform.service.ProductEsgProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-esg-profiles")
@Tag(name = "Product ESG Profiles", description = "Master data: product lifecycle sustainability profiles")
public class ProductEsgProfileController {

    @Autowired private ProductEsgProfileService productEsgProfileService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Create a new product ESG profile")
    public ResponseEntity<ProductEsgProfile> create(@RequestBody ProductEsgProfile profile) {
        return ResponseEntity.ok(productEsgProfileService.createProfile(profile));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update a product ESG profile")
    public ResponseEntity<ProductEsgProfile> update(@PathVariable Long id, @RequestBody ProductEsgProfile profile) {
        return ResponseEntity.ok(productEsgProfileService.updateProfile(id, profile));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a product ESG profile by ID")
    public ResponseEntity<ProductEsgProfile> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productEsgProfileService.getProfileById(id));
    }

    @GetMapping
    @Operation(summary = "Search product ESG profiles with pagination")
    public ResponseEntity<Page<ProductEsgProfile>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(productEsgProfileService.getProfiles(search, status, PageRequest.of(page, size, sort)));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all product profiles")
    public ResponseEntity<List<ProductEsgProfile>> getAll() {
        return ResponseEntity.ok(productEsgProfileService.getAllProfiles());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a product ESG profile")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productEsgProfileService.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }
}
