package com.ecosphere.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "carbon_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonTransaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "source_type", nullable = false)
    private String sourceType; // PURCHASE, MANUFACTURING, EXPENSE, FLEET

    @Column(name = "source_id")
    private String sourceId; // Linked transaction record ID

    @Column(name = "consumption_value", nullable = false)
    private Double consumptionValue;

    @Column(name = "emission_value", nullable = false)
    private Double emissionValue; // consumptionValue * factor

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;
}
