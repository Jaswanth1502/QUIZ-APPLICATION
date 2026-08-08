package com.quizapp.controller;

import com.quizapp.dto.response.*;
import com.quizapp.enums.Difficulty;
import com.quizapp.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PublicQuizController {
  private final QuizService service;

  @GetMapping("/categories")
  List<CategoryResponse> categories() {
    return service.categories();
  }

  @GetMapping("/quizzes")
  Page<QuizResponse> quizzes(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) Long category,
      @RequestParam(required = false) Difficulty difficulty,
      @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return service.catalogue(search, category, difficulty, pageable);
  }

  @GetMapping("/quizzes/{id}")
  QuizResponse quiz(@PathVariable Long id) {
    return service.details(id);
  }
}
