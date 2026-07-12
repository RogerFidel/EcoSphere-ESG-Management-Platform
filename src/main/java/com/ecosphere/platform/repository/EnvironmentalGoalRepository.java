package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.EnvironmentalGoal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EnvironmentalGoalRepository extends JpaRepository<EnvironmentalGoal, Long> {

    @Query("SELECT eg FROM EnvironmentalGoal eg WHERE " +
           "(:search IS NULL OR LOWER(eg.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(eg.unit) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR eg.status = :status)")
    Page<EnvironmentalGoal> searchGoals(@Param("search") String search,
                                        @Param("status") String status,
                                        Pageable pageable);
}
