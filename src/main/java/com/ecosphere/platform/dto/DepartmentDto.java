package com.ecosphere.platform.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentDto {

    private Long id;

    @NotBlank(message = "Department name is required")
    private String name;

    @NotBlank(message = "Department code is required")
    private String code;

    private String head;

    private Long parentId;

    @Min(value = 0, message = "Employee count cannot be negative")
    private Integer employeeCount;

    private String status;
}
