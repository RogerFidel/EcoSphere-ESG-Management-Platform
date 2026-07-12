package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.ChallengeParticipation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeParticipationRepository extends JpaRepository<ChallengeParticipation, Long> {

    @Query("SELECT cp FROM ChallengeParticipation cp WHERE " +
           "(:employeeId IS NULL OR cp.employee.id = :employeeId) AND " +
           "(:challengeId IS NULL OR cp.challenge.id = :challengeId) AND " +
           "(:status IS NULL OR cp.approvalStatus = :status)")
    Page<ChallengeParticipation> filterParticipations(@Param("employeeId") Long employeeId,
                                                      @Param("challengeId") Long challengeId,
                                                      @Param("status") String status,
                                                      Pageable pageable);

    @Query("SELECT COUNT(cp) FROM ChallengeParticipation cp WHERE cp.employee.department.id = :departmentId AND cp.approvalStatus = 'APPROVED'")
    Long countApprovedByDepartment(@Param("departmentId") Long departmentId);

    @Query("SELECT COUNT(cp) FROM ChallengeParticipation cp WHERE cp.employee.id = :employeeId AND cp.approvalStatus = 'APPROVED'")
    Long countApprovedByEmployee(@Param("employeeId") Long employeeId);

    List<ChallengeParticipation> findByEmployeeId(Long employeeId);
}
