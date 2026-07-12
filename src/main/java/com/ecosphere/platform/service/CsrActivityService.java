package com.ecosphere.platform.service;

import com.ecosphere.platform.entity.CsrActivity;
import com.ecosphere.platform.entity.EmployeeParticipation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface CsrActivityService {
    CsrActivity createActivity(CsrActivity activity);
    CsrActivity updateActivity(Long id, CsrActivity activity);
    CsrActivity getActivityById(Long id);
    Page<CsrActivity> getActivities(String search, Long categoryId, String status, LocalDate startDate, LocalDate endDate, Pageable pageable);
    void deleteActivity(Long id);
    EmployeeParticipation joinActivity(Long activityId, String username, String proofFileUrl);
    EmployeeParticipation approveParticipation(Long participationId, String approvalStatus, String approverUsername);
    Page<EmployeeParticipation> getParticipations(Long employeeId, Long activityId, String status, Pageable pageable);
}
