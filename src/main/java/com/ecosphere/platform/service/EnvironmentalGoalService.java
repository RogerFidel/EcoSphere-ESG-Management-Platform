package com.ecosphere.platform.service;

import com.ecosphere.platform.entity.EnvironmentalGoal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EnvironmentalGoalService {
    EnvironmentalGoal createGoal(EnvironmentalGoal goal);
    EnvironmentalGoal updateGoal(Long id, EnvironmentalGoal goal);
    EnvironmentalGoal getGoalById(Long id);
    Page<EnvironmentalGoal> getGoals(String search, String status, Pageable pageable);
    List<EnvironmentalGoal> getAllGoals();
    void deleteGoal(Long id);
}
