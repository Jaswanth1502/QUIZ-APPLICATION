package com.quizapp.controller;

import com.quizapp.dto.request.*;
import com.quizapp.dto.response.*;
import com.quizapp.enums.*;
import com.quizapp.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
  private final AdminService service;

  @GetMapping("/dashboard")
  DashboardResponse dashboard() { return service.dashboard(); }

  @GetMapping("/users")
  Page<UserResponse> users(@PageableDefault(size = 20) Pageable pageable) {
    return service.userList(pageable);
  }

  @GetMapping("/users/{id}/analytics")
  Map<String, Object> userAnalytics(@PathVariable Long id) {
    return service.userAnalytics(id);
  }

  @PatchMapping("/users/{id}/status")
  ResponseEntity<Void> userStatus(@PathVariable Long id, @RequestParam AccountStatus status) {
    service.userStatus(id, status);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/attempts")
  Page<AttemptDtos.Result> attempts(@PageableDefault(size = 20) Pageable pageable) {
    return service.attemptList(pageable);
  }

  @GetMapping("/categories")
  Page<CategoryResponse> categories(@PageableDefault(size = 20) Pageable pageable) {
    return service.categories(pageable);
  }

  @PostMapping("/categories")
  ResponseEntity<CategoryResponse> category(@Valid @RequestBody CategoryRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.createCategory(request));
  }

  @PutMapping("/categories/{id}")
  CategoryResponse category(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
    return service.updateCategory(id, request);
  }

  @PatchMapping("/categories/{id}/status")
  ResponseEntity<Void> categoryStatus(@PathVariable Long id, @RequestParam CategoryStatus status) {
    service.categoryStatus(id, status);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/categories/{id}")
  ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
    service.deleteCategory(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/quizzes")
  Page<QuizResponse> quizzes(@PageableDefault(size = 20) Pageable pageable) {
    return service.quizzes(pageable);
  }

  @PostMapping("/quizzes")
  ResponseEntity<QuizResponse> quiz(@Valid @RequestBody QuizRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.createQuiz(request));
  }

  @GetMapping("/quizzes/{id}")
  QuizResponse quiz(@PathVariable Long id) { return service.quiz(id); }

  @PutMapping("/quizzes/{id}")
  QuizResponse quiz(@PathVariable Long id, @Valid @RequestBody QuizRequest request) {
    return service.updateQuiz(id, request);
  }

  @PatchMapping("/quizzes/{id}/status")
  ResponseEntity<Void> quizStatus(@PathVariable Long id, @RequestParam QuizStatus status) {
    service.quizStatus(id, status);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/quizzes/{id}")
  ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
    service.deleteQuiz(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/quizzes/{id}/questions")
  List<Map<String, Object>> quizQuestions(@PathVariable Long id) {
    return service.quizQuestionList(id);
  }

  @PostMapping("/quizzes/{id}/questions")
  ResponseEntity<Void> addQuestion(@PathVariable Long id, @RequestParam Long questionId) {
    service.addQuestion(id, questionId);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/quizzes/{id}/questions/{questionId}")
  ResponseEntity<Void> removeQuestion(@PathVariable Long id, @PathVariable Long questionId) {
    service.removeQuestion(id, questionId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/questions")
  Page<Map<String, Object>> questions(@PageableDefault(size = 20) Pageable pageable) {
    return service.questionList(pageable);
  }

  @PostMapping("/questions")
  ResponseEntity<Map<String, Object>> question(@Valid @RequestBody QuestionRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.createQuestion(request));
  }

  @GetMapping("/questions/{id}")
  Map<String, Object> question(@PathVariable Long id) { return service.question(id); }

  @PutMapping("/questions/{id}")
  Map<String, Object> question(@PathVariable Long id, @Valid @RequestBody QuestionRequest request) {
    return service.updateQuestion(id, request);
  }

  @DeleteMapping("/questions/{id}")
  ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
    service.deleteQuestion(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/quizzes/{id}/statistics")
  Map<String, Object> statistics(@PathVariable Long id) {
    return service.quizStatistics(id);
  }
}
