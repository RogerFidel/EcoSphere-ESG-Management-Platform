package com.ecosphere.platform.service;

import com.ecosphere.platform.entity.Reward;
import com.ecosphere.platform.entity.RewardRedemption;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RewardService {
    Reward createReward(Reward reward);
    Reward updateReward(Long id, Reward reward);
    Reward getRewardById(Long id);
    Page<Reward> getRewards(String search, String status, Pageable pageable);
    List<Reward> getAllRewards();
    void deleteReward(Long id);
    RewardRedemption redeemReward(Long rewardId, String username);
    Page<RewardRedemption> getRedemptions(Long employeeId, String status, Pageable pageable);
    RewardRedemption updateRedemptionStatus(Long redemptionId, String status);
}
