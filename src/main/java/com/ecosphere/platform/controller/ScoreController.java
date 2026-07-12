package com.ecosphere.platform.controller;

import com.ecosphere.platform.dto.ScoreReportDto;
import com.ecosphere.platform.entity.DepartmentScore;
import com.ecosphere.platform.service.ScoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scores")
@Tag(name = "ESG Scores", description = "ESG score calculation and reporting for departments and platform")
public class ScoreController {

    @Autowired
    private ScoreService scoreService;

    @PostMapping("/departments/{departmentId}/calculate")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Calculate and persist ESG score for a specific department")
    public ResponseEntity<DepartmentScore> calculateDepartmentScore(@PathVariable Long departmentId) {
        return ResponseEntity.ok(scoreService.calculateDepartmentScore(departmentId));
    }

    @PostMapping("/calculate-all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Calculate ESG scores for ALL departments at once")
    public ResponseEntity<List<DepartmentScore>> calculateAllScores() {
        return ResponseEntity.ok(scoreService.calculateAllDepartmentScores());
    }

    @GetMapping("/departments/{departmentId}/latest")
    @Operation(summary = "Get the most recently calculated ESG score for a department")
    public ResponseEntity<DepartmentScore> getLatestDepartmentScore(@PathVariable Long departmentId) {
        return ResponseEntity.ok(scoreService.getLatestDepartmentScore(departmentId));
    }

    @GetMapping("/report")
    @Operation(summary = "Generate full platform ESG score report with all department breakdowns")
    public ResponseEntity<ScoreReportDto> getPlatformReport() {
        return ResponseEntity.ok(scoreService.generatePlatformScoreReport());
    }
}
