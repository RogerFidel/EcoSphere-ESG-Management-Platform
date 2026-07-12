package com.ecosphere.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "audits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Audit extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "auditor_name", nullable = false)
    private String auditorName;

    @Column(name = "audit_date", nullable = false)
    private LocalDate auditDate;

    @Column(nullable = false)
    private Double score = 0.0; // governance score assigned

    @Column(nullable = false)
    private String status = "DRAFT"; // DRAFT, COMPLETED, ARCHIVED
}
