package com.ecosphere.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "department_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentScore extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "environmental_score", nullable = false)
    private Double environmentalScore = 0.0;

    @Column(name = "social_score", nullable = false)
    private Double socialScore = 0.0;

    @Column(name = "governance_score", nullable = false)
    private Double governanceScore = 0.0;

    @Column(name = "total_score", nullable = false)
    private Double totalScore = 0.0;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;
}
