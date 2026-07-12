package com.ecosphere.platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rewards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reward extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "points_required", nullable = false)
    private Integer pointsRequired;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, OUT_OF_STOCK, INACTIVE
}
