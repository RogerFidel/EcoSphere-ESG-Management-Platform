package com.ecosphere.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceIssueDto {

    private Long id;

    private Long auditId;

    private String auditTitle;

    @NotBlank(message = "Severity is required")
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Owner ID is required")
    private Long ownerId;

    private String ownerName;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private String status; // OPEN, CLOSED, OVERDUE
}
