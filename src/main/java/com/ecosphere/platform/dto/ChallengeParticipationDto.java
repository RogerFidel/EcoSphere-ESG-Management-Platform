package com.ecosphere.platform.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeParticipationDto {

    private Long id;

    private Long challengeId;

    private String challengeTitle;

    private Long employeeId;

    private String employeeName;

    private Integer progress;

    private String proofFileUrl;

    private String approvalStatus;

    private Integer xpAwarded;

    private LocalDate completionDate;
}
