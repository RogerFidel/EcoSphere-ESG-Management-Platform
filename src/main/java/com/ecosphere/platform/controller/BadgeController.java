package com.ecosphere.platform.controller;

import com.ecosphere.platform.entity.Badge;
import com.ecosphere.platform.entity.EmployeeBadge;
import com.ecosphere.platform.service.BadgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@Tag(name = "Badges", description = "Master data: gamification achievement badges")
public class BadgeController {

    @Autowired private BadgeService badgeService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new badge")
    public ResponseEntity<Badge> create(@RequestBody Badge badge) {
        return ResponseEntity.ok(badgeService.createBadge(badge));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a badge")
    public ResponseEntity<Badge> update(@PathVariable Long id, @RequestBody Badge badge) {
        return ResponseEntity.ok(badgeService.updateBadge(id, badge));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a badge by ID")
    public ResponseEntity<Badge> getById(@PathVariable Long id) {
        return ResponseEntity.ok(badgeService.getBadgeById(id));
    }

    @GetMapping
    @Operation(summary = "Search badges with pagination")
    public ResponseEntity<Page<Badge>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(badgeService.getBadges(search, status, PageRequest.of(page, size, sort)));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all badges")
    public ResponseEntity<List<Badge>> getAll() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a badge")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        badgeService.deleteBadge(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get all badges earned by an employee")
    public ResponseEntity<List<EmployeeBadge>> getEmployeeBadges(@PathVariable Long employeeId) {
        return ResponseEntity.ok(badgeService.getEmployeeBadges(employeeId));
    }
}
