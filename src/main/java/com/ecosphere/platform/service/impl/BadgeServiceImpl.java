package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.entity.*;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.*;
import com.ecosphere.platform.service.BadgeService;
import com.ecosphere.platform.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BadgeServiceImpl implements BadgeService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private EmployeeBadgeRepository employeeBadgeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChallengeParticipationRepository challengeParticipationRepository;

    @Autowired
    private EsgConfigurationRepository esgConfigurationRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public Badge createBadge(Badge badge) {
        return badgeRepository.save(badge);
    }

    @Override
    @Transactional
    public Badge updateBadge(Long id, Badge badge) {
        Badge existing = getBadgeById(id);
        existing.setName(badge.getName());
        existing.setDescription(badge.getDescription());
        existing.setUnlockRule(badge.getUnlockRule());
        existing.setIcon(badge.getIcon());
        existing.setStatus(badge.getStatus());
        return badgeRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public Badge getBadgeById(Long id) {
        return badgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Badge> getBadges(String search, String status, Pageable pageable) {
        return badgeRepository.searchBadges(search, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteBadge(Long id) {
        Badge badge = getBadgeById(id);
        badgeRepository.delete(badge);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeBadge> getEmployeeBadges(Long employeeId) {
        return employeeBadgeRepository.findByEmployeeId(employeeId);
    }

    /**
     * Business Logic: Badge Auto Award
     * Evaluates employee XP and completed challenges against badge unlock rules.
     * Unlock rule format: XP_<threshold> or CHALLENGES_<count>
     */
    @Override
    @Transactional
    public void checkAndAwardBadges(Long employeeId) {
        EsgConfiguration config = esgConfigurationRepository.findFirstConfig().orElse(null);
        if (config == null || !config.getBadgeAutoAward()) {
            return; // Badge auto-award is disabled
        }

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        long completedChallenges = challengeParticipationRepository.countApprovedByEmployee(employeeId);
        int currentXp = employee.getXp();

        List<Badge> activeBadges = badgeRepository.findAll().stream()
                .filter(b -> "ACTIVE".equals(b.getStatus()))
                .toList();

        for (Badge badge : activeBadges) {
            if (employeeBadgeRepository.existsByEmployeeIdAndBadgeId(employeeId, badge.getId())) {
                continue; // Already awarded
            }

            String rule = badge.getUnlockRule();
            boolean unlocked = false;

            if (rule.startsWith("XP_")) {
                int xpThreshold = Integer.parseInt(rule.substring(3));
                unlocked = currentXp >= xpThreshold;
            } else if (rule.startsWith("CHALLENGES_")) {
                int challengeThreshold = Integer.parseInt(rule.substring(11));
                unlocked = completedChallenges >= challengeThreshold;
            }

            if (unlocked) {
                EmployeeBadge employeeBadge = EmployeeBadge.builder()
                        .employee(employee)
                        .badge(badge)
                        .awardedAt(LocalDateTime.now())
                        .build();
                employeeBadgeRepository.save(employeeBadge);

                notificationService.sendNotification(
                        employeeId,
                        "Congratulations! You've unlocked the badge: " + badge.getName(),
                        "BADGE_UNLOCK"
                );
            }
        }
    }
}
