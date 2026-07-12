package com.ecosphere.platform.controller;

import com.ecosphere.platform.entity.EnvironmentalGoal;
import com.ecosphere.platform.service.EnvironmentalGoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/environmental-goals")
@Tag(name = "Environmental Goals", description = "Master data: sustainability targets and milestones")
public class EnvironmentalGoalController {

    @Autowired private EnvironmentalGoalService environmentalGoalService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Create a new environmental goal")
    public ResponseEntity<EnvironmentalGoal> create(@RequestBody EnvironmentalGoal goal) {
        return ResponseEntity.ok(environmentalGoalService.createGoal(goal));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update an environmental goal")
    public ResponseEntity<EnvironmentalGoal> update(@PathVariable Long id, @RequestBody EnvironmentalGoal goal) {
        return ResponseEntity.ok(environmentalGoalService.updateGoal(id, goal));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an environmental goal by ID")
    public ResponseEntity<EnvironmentalGoal> getById(@PathVariable Long id) {
        return ResponseEntity.ok(environmentalGoalService.getGoalById(id));
    }

    @GetMapping
    @Operation(summary = "Search environmental goals with pagination and status filter")
    public ResponseEntity<Page<EnvironmentalGoal>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "deadline") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(environmentalGoalService.getGoals(search, status, PageRequest.of(page, size, sort)));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all environmental goals")
    public ResponseEntity<List<EnvironmentalGoal>> getAll() {
        return ResponseEntity.ok(environmentalGoalService.getAllGoals());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an environmental goal")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        environmentalGoalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}
