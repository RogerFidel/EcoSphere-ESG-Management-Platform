package com.ecosphere.platform.service;

import com.ecosphere.platform.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    Category createCategory(Category category);
    Category updateCategory(Long id, Category category);
    Category getCategoryById(Long id);
    Page<Category> getCategories(String search, String type, String status, Pageable pageable);
    List<Category> getAllCategories();
    void deleteCategory(Long id);
}
