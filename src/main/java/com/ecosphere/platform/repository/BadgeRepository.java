package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.Badge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {

    @Query("SELECT b FROM Badge b WHERE " +
           "(:search IS NULL OR LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(b.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR b.status = :status)")
    Page<Badge> searchBadges(@Param("search") String search,
                             @Param("status") String status,
                             Pageable pageable);
}
