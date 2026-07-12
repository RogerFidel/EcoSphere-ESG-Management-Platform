package com.ecosphere.platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "unlock_rule", nullable = false)
    private String unlockRule; // Format: XP_100 or CHALLENGES_5

    private String icon;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE
}
