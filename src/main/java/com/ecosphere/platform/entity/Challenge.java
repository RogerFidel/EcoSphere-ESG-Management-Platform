package com.ecosphere.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "challenges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Challenge extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Integer xp = 0;

    @Column(nullable = false)
    private String difficulty = "EASY"; // EASY, MEDIUM, HARD

    @Column(name = "evidence_required", nullable = false)
    private Boolean evidenceRequired = false;

    private LocalDate deadline;

    @Column(nullable = false)
    private String status = "DRAFT"; // DRAFT, ACTIVE, UNDER_REVIEW, COMPLETED, ARCHIVED
}
