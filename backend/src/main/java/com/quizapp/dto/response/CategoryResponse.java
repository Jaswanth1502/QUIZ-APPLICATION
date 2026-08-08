package com.quizapp.dto.response;
import com.quizapp.entity.Category;
public record CategoryResponse(Long id, String name, String description, String status) {
  public static CategoryResponse from(Category category) {
    return new CategoryResponse(category.getId(), category.getName(), category.getDescription(), category.getStatus().name());
  }
}
