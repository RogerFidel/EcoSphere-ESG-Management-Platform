package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.dto.ScoreReportDto;
import com.ecosphere.platform.entity.*;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.*;
import com.ecosphere.platform.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScoreServiceImpl implements ScoreService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DepartmentScoreRepository departmentScoreRepository;

    @Autowired
    private CarbonTransactionRepository carbonTransactionRepository;

    @Autowired
    private EmployeeParticipationRepository employeeParticipationRepository;

    @Autowired
    private ChallengeParticipationRepository challengeParticipationRepository;

    @Autowired
    private PolicyAcknowledgementRepository policyAcknowledgementRepository;

    @Autowired
    private EsgPolicyRepository esgPolicyRepository;

    @Autowired
    private ComplianceIssueRepository complianceIssueRepository;

    @Autowired
    private EsgConfigurationRepository esgConfigurationRepository;

    /**
     * Business Logic: ESG Score Calculation
     *
     * Environmental Score = max(0, 100 - (totalEmissions / max(1, employeeCount)))
     * Social Score = (approvedCSRParticipations + approvedChallenges) * 5 capped at 100
     * Governance Score = (acknowledgedPolicies / totalActivePolicies) * 100
     *                    - (openIssueCount * penaltyPerIssue) capped at min 0
     * Total Score = envWeight*E + socialWeight*S + govWeight*G  (weights from EsgConfiguration)
     */
    @Override
    @Transactional
    public DepartmentScore calculateDepartmentScore(Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + departmentId));

        EsgConfiguration config = esgConfigurationRepository.findFirstConfig()
                .orElseGet(EsgConfiguration::new);

        // --- Environmental Score ---
        Double totalEmissions = carbonTransactionRepository.sumEmissionsByDepartment(departmentId);
        if (totalEmissions == null) totalEmissions = 0.0;
        int empCount = Math.max(1, department.getEmployeeCount());
        double envScore = Math.max(0.0, 100.0 - (totalEmissions / empCount));
        envScore = Math.min(100.0, envScore);

        // --- Social Score ---
        Long approvedCsr = employeeParticipationRepository.countApprovedByDepartment(departmentId);
        Long approvedChallenges = challengeParticipationRepository.countApprovedByDepartment(departmentId);
        double socialScore = Math.min(100.0, (approvedCsr + approvedChallenges) * 5.0);

        // --- Governance Score ---
        long totalPolicies = esgPolicyRepository.count();
        long acknowledgedPolicies = policyAcknowledgementRepository.countByDepartmentId(departmentId);
        double govScore = totalPolicies > 0 ? ((double) acknowledgedPolicies / totalPolicies) * 100.0 : 100.0;
        Long openIssues = complianceIssueRepository.countOpenIssuesByDepartment(departmentId);
        govScore = Math.max(0.0, govScore - (openIssues * 5.0)); // -5 per open/overdue issue

        // --- Weighted Total ---
        double envW = config.getEnvWeight() / 100.0;
        double socW = config.getSocialWeight() / 100.0;
        double govW = config.getGovWeight() / 100.0;
        double totalScore = (envScore * envW) + (socialScore * socW) + (govScore * govW);

        DepartmentScore score = DepartmentScore.builder()
                .department(department)
                .environmentalScore(Math.round(envScore * 100.0) / 100.0)
                .socialScore(Math.round(socialScore * 100.0) / 100.0)
                .governanceScore(Math.round(govScore * 100.0) / 100.0)
                .totalScore(Math.round(totalScore * 100.0) / 100.0)
                .calculatedAt(LocalDateTime.now())
                .build();

        return departmentScoreRepository.save(score);
    }

    @Override
    @Transactional
    public List<DepartmentScore> calculateAllDepartmentScores() {
        List<Department> departments = departmentRepository.findAll();
        List<DepartmentScore> scores = new ArrayList<>();
        for (Department dept : departments) {
            scores.add(calculateDepartmentScore(dept.getId()));
        }
        return scores;
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentScore getLatestDepartmentScore(Long departmentId) {
        departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + departmentId));
        return departmentScoreRepository.findLatestByDepartmentId(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No score calculated yet for department ID: " + departmentId));
    }

    @Override
    @Transactional(readOnly = true)
    public ScoreReportDto generatePlatformScoreReport() {
        List<Department> departments = departmentRepository.findAll();
        List<ScoreReportDto.DepartmentScoreSummary> summaries = new ArrayList<>();
        double platformTotal = 0.0;
        int count = 0;

        for (Department dept : departments) {
            departmentScoreRepository.findLatestByDepartmentId(dept.getId()).ifPresent(ds -> {
                summaries.add(ScoreReportDto.DepartmentScoreSummary.builder()
                        .departmentId(dept.getId())
                        .departmentName(dept.getName())
                        .environmentalScore(ds.getEnvironmentalScore())
                        .socialScore(ds.getSocialScore())
                        .governanceScore(ds.getGovernanceScore())
                        .totalScore(ds.getTotalScore())
                        .build());
            });
        }

        double overallScore = summaries.isEmpty() ? 0.0 :
                summaries.stream().mapToDouble(ScoreReportDto.DepartmentScoreSummary::getTotalScore).average().orElse(0.0);

        return ScoreReportDto.builder()
                .overallEsgScore(Math.round(overallScore * 100.0) / 100.0)
                .departmentScores(summaries)
                .build();
    }
}
