package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.entity.*;
import com.ecosphere.platform.exception.BadRequestException;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.*;
import com.ecosphere.platform.service.BadgeService;
import com.ecosphere.platform.service.CsrActivityService;
import com.ecosphere.platform.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class CsrActivityServiceImpl implements CsrActivityService {

    @Autowired
    private CsrActivityRepository csrActivityRepository;

    @Autowired
    private EmployeeParticipationRepository employeeParticipationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private BadgeService badgeService;

    @Override
    @Transactional
    public CsrActivity createActivity(CsrActivity activity) {
        return csrActivityRepository.save(activity);
    }

    @Override
    @Transactional
    public CsrActivity updateActivity(Long id, CsrActivity activity) {
        CsrActivity existing = getActivityById(id);
        existing.setTitle(activity.getTitle());
        existing.setDescription(activity.getDescription());
        existing.setCategory(activity.getCategory());
        existing.setStartDate(activity.getStartDate());
        existing.setEndDate(activity.getEndDate());
        existing.setPointsToAward(activity.getPointsToAward());
        existing.setStatus(activity.getStatus());
        return csrActivityRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public CsrActivity getActivityById(Long id) {
        return csrActivityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CSR Activity not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CsrActivity> getActivities(String search, Long categoryId, String status,
                                            LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return csrActivityRepository.filterActivities(search, categoryId, status, startDate, endDate, pageable);
    }

    @Override
    @Transactional
    public void deleteActivity(Long id) {
        CsrActivity activity = getActivityById(id);
        csrActivityRepository.delete(activity);
    }

    @Override
    @Transactional
    public EmployeeParticipation joinActivity(Long activityId, String username, String proofFileUrl) {
        CsrActivity activity = getActivityById(activityId);
        User employee = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (!"ACTIVE".equals(activity.getStatus())) {
            throw new BadRequestException("This CSR activity is not active");
        }

        EmployeeParticipation participation = EmployeeParticipation.builder()
                .employee(employee)
                .activity(activity)
                .proofFileUrl(proofFileUrl)
                .approvalStatus("PENDING")
                .pointsEarned(0)
                .build();
        return employeeParticipationRepository.save(participation);
    }

    @Override
    @Transactional
    public EmployeeParticipation approveParticipation(Long participationId, String approvalStatus, String approverUsername) {
        EmployeeParticipation participation = employeeParticipationRepository.findById(participationId)
                .orElseThrow(() -> new ResourceNotFoundException("Participation not found with ID: " + participationId));

        if (!"PENDING".equals(participation.getApprovalStatus())) {
            throw new BadRequestException("Participation is already " + participation.getApprovalStatus());
        }

        participation.setApprovalStatus(approvalStatus);

        if ("APPROVED".equals(approvalStatus)) {
            int pointsToAward = participation.getActivity().getPointsToAward();
            participation.setPointsEarned(pointsToAward);
            participation.setCompletionDate(LocalDate.now());

            User employee = participation.getEmployee();
            employee.setPoints(employee.getPoints() + pointsToAward);
            userRepository.save(employee);

            notificationService.sendNotification(
                    employee.getId(),
                    "Your participation in '" + participation.getActivity().getTitle() + "' has been approved! You earned " + pointsToAward + " points.",
                    "APPROVAL_DECISION"
            );

            badgeService.checkAndAwardBadges(employee.getId());
        } else if ("REJECTED".equals(approvalStatus)) {
            notificationService.sendNotification(
                    participation.getEmployee().getId(),
                    "Your participation in '" + participation.getActivity().getTitle() + "' has been rejected.",
                    "APPROVAL_DECISION"
            );
        }

        return employeeParticipationRepository.save(participation);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeParticipation> getParticipations(Long employeeId, Long activityId, String status, Pageable pageable) {
        return employeeParticipationRepository.filterParticipations(employeeId, activityId, status, pageable);
    }
}
