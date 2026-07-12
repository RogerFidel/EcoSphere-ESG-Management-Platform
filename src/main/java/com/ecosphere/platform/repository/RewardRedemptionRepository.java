package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.RewardRedemption;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RewardRedemptionRepository extends JpaRepository<RewardRedemption, Long> {

    @Query("SELECT rr FROM RewardRedemption rr WHERE " +
           "(:employeeId IS NULL OR rr.employee.id = :employeeId) AND " +
           "(:status IS NULL OR rr.status = :status)")
    Page<RewardRedemption> filterRedemptions(@Param("employeeId") Long employeeId,
                                             @Param("status") String status,
                                             Pageable pageable);
}
