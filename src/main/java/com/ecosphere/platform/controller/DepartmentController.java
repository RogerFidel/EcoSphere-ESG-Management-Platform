package com.ecosphere.platform.controller;

import com.ecosphere.platform.dto.DepartmentDto;
import com.ecosphere.platform.entity.Department;
import com.ecosphere.platform.service.AuditLogService;
import com.ecosphere.platform.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@Tag(name = "Departments", description = "Master data: organizational departments")
public class DepartmentController {

    @Autowired private DepartmentService departmentService;
    @Autowired private AuditLogService auditLogService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new department")
    public ResponseEntity<Department> create(@Valid @RequestBody DepartmentDto dto, Authentication auth) {
        Department dept = departmentService.createDepartment(dto);
        auditLogService.log(auth.getName(), "CREATE_DEPARTMENT", "Department created: " + dept.getName());
        return ResponseEntity.ok(dept);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing department")
    public ResponseEntity<Department> update(@PathVariable Long id, @Valid @RequestBody DepartmentDto dto, Authentication auth) {
        Department dept = departmentService.updateDepartment(id, dto);
        auditLogService.log(auth.getName(), "UPDATE_DEPARTMENT", "Department updated: " + dept.getName());
        return ResponseEntity.ok(dept);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a department by ID")
    public ResponseEntity<Department> getById(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }

    @GetMapping
    @Operation(summary = "Search and list departments with pagination, filtering, and sorting")
    public ResponseEntity<Page<Department>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(departmentService.getDepartments(search, status, pageable));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all departments (no pagination, for dropdowns)")
    public ResponseEntity<List<Department>> getAll() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a department")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        auditLogService.log(auth.getName(), "DELETE_DEPARTMENT", "Department deleted with ID: " + id);
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}
