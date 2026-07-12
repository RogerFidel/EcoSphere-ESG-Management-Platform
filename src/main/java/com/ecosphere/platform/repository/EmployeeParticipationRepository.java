package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.EmployeeParticipation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeParticipationRepository extends JpaRepository<EmployeeParticipation, Long> {

    @Query("SELECT ep FROM EmployeeParticipation ep WHERE " +
           "(:employeeId IS NULL OR ep.employee.id = :employeeId) AND " +
           "(:activityId IS NULL OR ep.activity.id = :activityId) AND " +
           "(:status IS NULL OR ep.approvalStatus = :status)")
    Page<EmployeeParticipation> filterParticipations(@Param("employeeId") Long employeeId,
                                                     @Param("activityId") Long activityId,
                                                     @Param("status") String status,
                                                     Pageable pageable);

    @Query("SELECT COUNT(ep) FROM EmployeeParticipation ep WHERE ep.employee.department.id = :departmentId AND ep.approvalStatus = 'APPROVED'")
    Long countApprovedByDepartment(@Param("departmentId") Long departmentId);

    @Query("SELECT ep FROM EmployeeParticipation ep WHERE ep.employee.id = :employeeId AND ep.approvalStatus = 'APPROVED'")
    List<EmployeeParticipation> findApprovedByEmployeeId(@Param("employeeId") Long employeeId);
}
