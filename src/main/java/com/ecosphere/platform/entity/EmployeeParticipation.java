package com.ecosphere.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "employee_participations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeParticipation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private CsrActivity activity;

    @Column(name = "proof_file_url")
    private String proofFileUrl;

    @Column(name = "approval_status", nullable = false)
    private String approvalStatus = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "points_earned")
    private Integer pointsEarned = 0;

    @Column(name = "completion_date")
    private LocalDate completionDate;
}
