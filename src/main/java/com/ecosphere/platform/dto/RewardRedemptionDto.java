package com.ecosphere.platform.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardRedemptionDto {

    private Long id;

    private Long employeeId;

    private String employeeName;

    private Long rewardId;

    private String rewardName;

    private Integer pointsSpent;

    private LocalDateTime redeemedAt;

    private String status;
}
