package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.CarbonTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CarbonTransactionRepository extends JpaRepository<CarbonTransaction, Long> {

    @Query("SELECT c FROM CarbonTransaction c WHERE " +
           "(:departmentId IS NULL OR c.department.id = :departmentId) AND " +
           "(:sourceType IS NULL OR c.sourceType = :sourceType) AND " +
           "(cast(:startDate as date) IS NULL OR c.transactionDate >= :startDate) AND " +
           "(cast(:endDate as date) IS NULL OR c.transactionDate <= :endDate)")
    Page<CarbonTransaction> filterTransactions(@Param("departmentId") Long departmentId,
                                               @Param("sourceType") String sourceType,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate,
                                               Pageable pageable);

    @Query("SELECT SUM(c.emissionValue) FROM CarbonTransaction c WHERE c.department.id = :departmentId")
    Double sumEmissionsByDepartment(@Param("departmentId") Long departmentId);

    @Query("SELECT c FROM CarbonTransaction c WHERE c.department.id = :departmentId")
    List<CarbonTransaction> findByDepartmentId(@Param("departmentId") Long departmentId);
}
