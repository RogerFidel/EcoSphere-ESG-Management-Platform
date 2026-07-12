package com.ecosphere.platform.service;

import com.ecosphere.platform.dto.ScoreReportDto;
import com.ecosphere.platform.entity.DepartmentScore;

import java.util.List;

public interface ScoreService {
    DepartmentScore calculateDepartmentScore(Long departmentId);
    List<DepartmentScore> calculateAllDepartmentScores();
    DepartmentScore getLatestDepartmentScore(Long departmentId);
    ScoreReportDto generatePlatformScoreReport();
}
