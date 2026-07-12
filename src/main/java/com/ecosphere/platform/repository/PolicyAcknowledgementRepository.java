package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.PolicyAcknowledgement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PolicyAcknowledgementRepository extends JpaRepository<PolicyAcknowledgement, Long> {

    Optional<PolicyAcknowledgement> findByPolicyIdAndEmployeeId(Long policyId, Long employeeId);

    boolean existsByPolicyIdAndEmployeeId(Long policyId, Long employeeId);

    @Query("SELECT COUNT(pa) FROM PolicyAcknowledgement pa WHERE pa.employee.department.id = :departmentId")
    Long countByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT pa FROM PolicyAcknowledgement pa WHERE " +
           "(:employeeId IS NULL OR pa.employee.id = :employeeId) AND " +
           "(:policyId IS NULL OR pa.policy.id = :policyId)")
    Page<PolicyAcknowledgement> filterAcknowledgements(@Param("employeeId") Long employeeId,
                                                       @Param("policyId") Long policyId,
                                                       Pageable pageable);
}
