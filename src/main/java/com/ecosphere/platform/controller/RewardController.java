package com.ecosphere.platform.controller;

import com.ecosphere.platform.entity.Reward;
import com.ecosphere.platform.entity.RewardRedemption;
import com.ecosphere.platform.service.RewardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rewards")
@Tag(name = "Rewards", description = "Gamification rewards and redemptions")
public class RewardController {

    @Autowired private RewardService rewardService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new reward")
    public ResponseEntity<Reward> create(@RequestBody Reward reward) {
        return ResponseEntity.ok(rewardService.createReward(reward));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a reward")
    public ResponseEntity<Reward> update(@PathVariable Long id, @RequestBody Reward reward) {
        return ResponseEntity.ok(rewardService.updateReward(id, reward));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a reward by ID")
    public ResponseEntity<Reward> getById(@PathVariable Long id) {
        return ResponseEntity.ok(rewardService.getRewardById(id));
    }

    @GetMapping
    @Operation(summary = "Search rewards with pagination")
    public ResponseEntity<Page<Reward>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "pointsRequired") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(rewardService.getRewards(search, status, PageRequest.of(page, size, sort)));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all rewards")
    public ResponseEntity<List<Reward>> getAll() {
        return ResponseEntity.ok(rewardService.getAllRewards());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a reward")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rewardService.deleteReward(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{rewardId}/redeem")
    @Operation(summary = "Redeem a reward using points (Employee)")
    public ResponseEntity<RewardRedemption> redeem(@PathVariable Long rewardId, Authentication auth) {
        return ResponseEntity.ok(rewardService.redeemReward(rewardId, auth.getName()));
    }

    @GetMapping("/redemptions")
    @Operation(summary = "Get reward redemptions with filtering")
    public ResponseEntity<Page<RewardRedemption>> getRedemptions(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(rewardService.getRedemptions(employeeId, status, PageRequest.of(page, size)));
    }

    @PatchMapping("/redemptions/{redemptionId}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update redemption status (Admin/Manager)")
    public ResponseEntity<RewardRedemption> updateRedemptionStatus(
            @PathVariable Long redemptionId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(rewardService.updateRedemptionStatus(redemptionId, body.get("status")));
    }
}
