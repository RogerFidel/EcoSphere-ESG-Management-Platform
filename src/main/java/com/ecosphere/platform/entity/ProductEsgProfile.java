package com.ecosphere.platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_esg_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductEsgProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_name", nullable = false, unique = true)
    private String productName;

    @Column(name = "carbon_footprint", nullable = false)
    private Double carbonFootprint; // in kg CO2e

    @Column(name = "recycling_percentage", nullable = false)
    private Double recyclingPercentage; // 0 to 100

    @Column(name = "packaging_material")
    private String packagingMaterial;

    @Column(name = "water_usage")
    private Double waterUsage; // in liters

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE
}
