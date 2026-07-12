package com.ecosphere.platform.service;

import com.ecosphere.platform.entity.Badge;
import com.ecosphere.platform.entity.EmployeeBadge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BadgeService {
    Badge createBadge(Badge badge);
    Badge updateBadge(Long id, Badge badge);
    Badge getBadgeById(Long id);
    Page<Badge> getBadges(String search, String status, Pageable pageable);
    List<Badge> getAllBadges();
    void deleteBadge(Long id);
    List<EmployeeBadge> getEmployeeBadges(Long employeeId);
    void checkAndAwardBadges(Long employeeId);
}
