package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.EmployeeBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeBadgeRepository extends JpaRepository<EmployeeBadge, Long> {

    boolean existsByEmployeeIdAndBadgeId(Long employeeId, Long badgeId);

    List<EmployeeBadge> findByEmployeeId(Long employeeId);
}
