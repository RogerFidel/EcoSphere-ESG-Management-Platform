package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.entity.*;
import com.ecosphere.platform.exception.BadRequestException;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.*;
import com.ecosphere.platform.service.RewardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RewardServiceImpl implements RewardService {

    @Autowired
    private RewardRepository rewardRepository;

    @Autowired
    private RewardRedemptionRepository rewardRedemptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public Reward createReward(Reward reward) {
        return rewardRepository.save(reward);
    }

    @Override
    @Transactional
    public Reward updateReward(Long id, Reward reward) {
        Reward existing = getRewardById(id);
        existing.setName(reward.getName());
        existing.setDescription(reward.getDescription());
        existing.setPointsRequired(reward.getPointsRequired());
        existing.setStock(reward.getStock());
        existing.setStatus(reward.getStatus());
        return rewardRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public Reward getRewardById(Long id) {
        return rewardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reward not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Reward> getRewards(String search, String status, Pageable pageable) {
        return rewardRepository.searchRewards(search, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reward> getAllRewards() {
        return rewardRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteReward(Long id) {
        Reward reward = getRewardById(id);
        rewardRepository.delete(reward);
    }

    /**
     * Business Logic: Reward Redemption
     * Validates employee points, checks stock availability, deducts points and stock atomically.
     */
    @Override
    @Transactional
    public RewardRedemption redeemReward(Long rewardId, String username) {
        Reward reward = getRewardById(rewardId);
        User employee = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (!"ACTIVE".equals(reward.getStatus())) {
            throw new BadRequestException("Reward is not available for redemption");
        }
        if (reward.getStock() <= 0) {
            throw new BadRequestException("Reward is out of stock");
        }
        if (employee.getPoints() < reward.getPointsRequired()) {
            throw new BadRequestException("Insufficient points. Required: " + reward.getPointsRequired()
                    + ", Available: " + employee.getPoints());
        }

        // Deduct points and decrement stock atomically
        employee.setPoints(employee.getPoints() - reward.getPointsRequired());
        reward.setStock(reward.getStock() - 1);
        if (reward.getStock() == 0) {
            reward.setStatus("OUT_OF_STOCK");
        }

        userRepository.save(employee);
        rewardRepository.save(reward);

        RewardRedemption redemption = RewardRedemption.builder()
                .employee(employee)
                .reward(reward)
                .pointsSpent(reward.getPointsRequired())
                .redeemedAt(LocalDateTime.now())
                .status("REQUESTED")
                .build();
        return rewardRedemptionRepository.save(redemption);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RewardRedemption> getRedemptions(Long employeeId, String status, Pageable pageable) {
        return rewardRedemptionRepository.filterRedemptions(employeeId, status, pageable);
    }

    @Override
    @Transactional
    public RewardRedemption updateRedemptionStatus(Long redemptionId, String status) {
        RewardRedemption redemption = rewardRedemptionRepository.findById(redemptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Redemption not found with ID: " + redemptionId));
        redemption.setStatus(status);
        return rewardRedemptionRepository.save(redemption);
    }
}
