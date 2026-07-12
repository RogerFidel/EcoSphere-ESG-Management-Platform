package com.ecosphere.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "challenge_participations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeParticipation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @Column(nullable = false)
    private Integer progress = 0; // percentage completion (0-100)

    @Column(name = "proof_file_url")
    private String proofFileUrl;

    @Column(name = "approval_status", nullable = false)
    private String approvalStatus = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "xp_awarded")
    private Integer xpAwarded = 0;

    @Column(name = "completion_date")
    private LocalDate completionDate;
}
