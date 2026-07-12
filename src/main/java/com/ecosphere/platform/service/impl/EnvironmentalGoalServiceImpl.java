package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.entity.EnvironmentalGoal;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.EnvironmentalGoalRepository;
import com.ecosphere.platform.service.EnvironmentalGoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnvironmentalGoalServiceImpl implements EnvironmentalGoalService {

    @Autowired
    private EnvironmentalGoalRepository environmentalGoalRepository;

    @Override
    @Transactional
    public EnvironmentalGoal createGoal(EnvironmentalGoal goal) {
        return environmentalGoalRepository.save(goal);
    }

    @Override
    @Transactional
    public EnvironmentalGoal updateGoal(Long id, EnvironmentalGoal goal) {
        EnvironmentalGoal existing = getGoalById(id);
        existing.setTitle(goal.getTitle());
        existing.setTargetValue(goal.getTargetValue());
        existing.setCurrentValue(goal.getCurrentValue());
        existing.setUnit(goal.getUnit());
        existing.setDeadline(goal.getDeadline());
        existing.setStatus(goal.getStatus());
        return environmentalGoalRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public EnvironmentalGoal getGoalById(Long id) {
        return environmentalGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Environmental goal not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EnvironmentalGoal> getGoals(String search, String status, Pageable pageable) {
        return environmentalGoalRepository.searchGoals(search, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnvironmentalGoal> getAllGoals() {
        return environmentalGoalRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteGoal(Long id) {
        EnvironmentalGoal goal = getGoalById(id);
        environmentalGoalRepository.delete(goal);
    }
}
