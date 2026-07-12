package com.ecosphere.platform.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CsrParticipationDto {

    private Long id;

    private Long employeeId;

    private String employeeName;

    private Long activityId;

    private String activityTitle;

    private String proofFileUrl;

    private String approvalStatus;

    private Integer pointsEarned;

    private LocalDate completionDate;
}
