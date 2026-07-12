package com.ecosphere.platform.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreReportDto {

    private Double overallEsgScore;

    private List<DepartmentScoreSummary> departmentScores;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartmentScoreSummary {
        private Long departmentId;
        private String departmentName;
        private Double environmentalScore;
        private Double socialScore;
        private Double governanceScore;
        private Double totalScore;
    }
}
