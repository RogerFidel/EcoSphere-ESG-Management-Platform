package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.Challenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    @Query("SELECT c FROM Challenge c WHERE " +
           "(:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:categoryId IS NULL OR c.category.id = :categoryId) AND " +
           "(:difficulty IS NULL OR c.difficulty = :difficulty) AND " +
           "(:status IS NULL OR c.status = :status)")
    Page<Challenge> filterChallenges(@Param("search") String search,
                                     @Param("categoryId") Long categoryId,
                                     @Param("difficulty") String difficulty,
                                     @Param("status") String status,
                                     Pageable pageable);
}
