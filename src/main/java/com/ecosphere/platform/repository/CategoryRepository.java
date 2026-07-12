package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c WHERE " +
           "(:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:type IS NULL OR c.type = :type) AND " +
           "(:status IS NULL OR c.status = :status)")
    Page<Category> searchCategories(@Param("search") String search,
                                    @Param("type") String type,
                                    @Param("status") String status,
                                    Pageable pageable);
}
