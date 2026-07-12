package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.DepartmentScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentScoreRepository extends JpaRepository<DepartmentScore, Long> {

    @Query("SELECT ds FROM DepartmentScore ds WHERE ds.department.id = :departmentId ORDER BY ds.calculatedAt DESC LIMIT 1")
    Optional<DepartmentScore> findLatestByDepartmentId(@Param("departmentId") Long departmentId);
}
