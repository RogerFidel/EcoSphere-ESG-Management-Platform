package com.ecosphere.platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "emission_factors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmissionFactor extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private Double value; // emission calculation rate per unit

    @Column(nullable = false)
    private String unit; // kg CO2e / unit

    @Column(name = "activity_type", nullable = false)
    private String activityType; // PURCHASE, MANUFACTURING, EXPENSE, FLEET

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE
}
