package com.ecosphere.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "environmental_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvironmentalGoal extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "target_value", nullable = false)
    private Double targetValue;

    @Column(name = "current_value", nullable = false)
    private Double currentValue = 0.0;

    @Column(nullable = false)
    private String unit;

    @Column(nullable = false)
    private LocalDate deadline;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, ACHIEVED, EXPIRED
}
