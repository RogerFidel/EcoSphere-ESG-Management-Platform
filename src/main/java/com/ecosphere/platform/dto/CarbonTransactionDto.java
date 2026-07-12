package com.ecosphere.platform.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonTransactionDto {

    private Long id;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotNull(message = "Source type is required")
    private String sourceType; // PURCHASE, MANUFACTURING, EXPENSE, FLEET

    private String sourceId;

    @NotNull(message = "Consumption value is required")
    @Positive(message = "Consumption value must be positive")
    private Double consumptionValue;

    private Double emissionValue; // Optional in request, calculated automatically

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;
}
