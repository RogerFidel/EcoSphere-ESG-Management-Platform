package com.ecosphere.platform.service;

import com.ecosphere.platform.dto.DepartmentDto;
import com.ecosphere.platform.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DepartmentService {
    Department createDepartment(DepartmentDto dto);
    Department updateDepartment(Long id, DepartmentDto dto);
    Department getDepartmentById(Long id);
    Page<Department> getDepartments(String search, String status, Pageable pageable);
    List<Department> getAllDepartments();
    void deleteDepartment(Long id);
}
