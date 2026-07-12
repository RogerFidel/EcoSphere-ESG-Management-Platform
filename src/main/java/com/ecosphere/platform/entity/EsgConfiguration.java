package com.ecosphere.platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "esg_configurations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EsgConfiguration extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "auto_emission_calculation", nullable = false)
    private Boolean autoEmissionCalculation = true;

    @Column(name = "evidence_requirement", nullable = false)
    private Boolean evidenceRequirement = true;

    @Column(name = "badge_auto_award", nullable = false)
    private Boolean badgeAutoAward = true;

    @Column(name = "env_weight", nullable = false)
    private Double envWeight = 40.0;

    @Column(name = "social_weight", nullable = false)
    private Double socialWeight = 30.0;

    @Column(name = "gov_weight", nullable = false)
    private Double govWeight = 30.0;
}
