package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.dto.DepartmentDto;
import com.ecosphere.platform.entity.Department;
import com.ecosphere.platform.exception.BadRequestException;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.DepartmentRepository;
import com.ecosphere.platform.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    @Transactional
    public Department createDepartment(DepartmentDto dto) {
        if (departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department name already exists");
        }
        if (departmentRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Department code already exists");
        }

        Department parent = null;
        if (dto.getParentId() != null) {
            parent = departmentRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent department not found"));
        }

        Department dept = Department.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .head(dto.getHead())
                .parentDepartment(parent)
                .employeeCount(dto.getEmployeeCount() != null ? dto.getEmployeeCount() : 0)
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .build();

        return departmentRepository.save(dept);
    }

    @Override
    @Transactional
    public Department updateDepartment(Long id, DepartmentDto dto) {
        Department dept = getDepartmentById(id);

        if (!dept.getName().equalsIgnoreCase(dto.getName()) && departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department name already exists");
        }
        if (!dept.getCode().equalsIgnoreCase(dto.getCode()) && departmentRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Department code already exists");
        }

        Department parent = null;
        if (dto.getParentId() != null) {
            if (dto.getParentId().equals(id)) {
                throw new BadRequestException("A department cannot be its own parent");
            }
            parent = departmentRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent department not found"));
        }

        dept.setName(dto.getName());
        dept.setCode(dto.getCode());
        dept.setHead(dto.getHead());
        dept.setParentDepartment(parent);
        if (dto.getEmployeeCount() != null) {
            dept.setEmployeeCount(dto.getEmployeeCount());
        }
        if (dto.getStatus() != null) {
            dept.setStatus(dto.getStatus());
        }

        return departmentRepository.save(dept);
    }

    @Override
    @Transactional(readOnly = true)
    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Department> getDepartments(String search, String status, Pageable pageable) {
        return departmentRepository.searchDepartments(search, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = getDepartmentById(id);
        departmentRepository.delete(dept);
    }
}
