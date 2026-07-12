package com.ecosphere.platform.controller;

import com.ecosphere.platform.dto.CarbonTransactionDto;
import com.ecosphere.platform.entity.CarbonTransaction;
import com.ecosphere.platform.service.CarbonTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/carbon-transactions")
@Tag(name = "Carbon Transactions", description = "Transactional: carbon footprint logging with auto-calculation")
public class CarbonTransactionController {

    @Autowired private CarbonTransactionService carbonTransactionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Log a new carbon transaction (auto-calculates emission if enabled)")
    public ResponseEntity<CarbonTransaction> create(@Valid @RequestBody CarbonTransactionDto dto) {
        return ResponseEntity.ok(carbonTransactionService.createTransaction(dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a carbon transaction by ID")
    public ResponseEntity<CarbonTransaction> getById(@PathVariable Long id) {
        return ResponseEntity.ok(carbonTransactionService.getTransactionById(id));
    }

    @GetMapping
    @Operation(summary = "Filter carbon transactions by department, source type, and date range")
    public ResponseEntity<Page<CarbonTransaction>> getAll(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String sourceType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(carbonTransactionService.getTransactions(departmentId, sourceType, startDate, endDate, PageRequest.of(page, size, sort)));
    }

    @GetMapping("/department/{departmentId}/total-emissions")
    @Operation(summary = "Get total carbon emissions for a department")
    public ResponseEntity<Map<String, Double>> getDepartmentTotalEmissions(@PathVariable Long departmentId) {
        return ResponseEntity.ok(Map.of("totalEmissions", carbonTransactionService.getDepartmentTotalEmissions(departmentId)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a carbon transaction")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        carbonTransactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
