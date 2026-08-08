package com.quizapp.service;

import com.quizapp.dto.response.*;
import com.quizapp.entity.Quiz;
import com.quizapp.enums.*;
import com.quizapp.exception.ApiException;
import com.quizapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuizService {
  private final QuizRepository quizzes;
  private final QuizQuestionRepository quizQuestions;
  private final CategoryRepository categories;

  public List<CategoryResponse> categories() {
    return categories.findByStatus(CategoryStatus.ACTIVE).stream().map(CategoryResponse::from).toList();
  }

  public Page<QuizResponse> catalogue(String search, Long category, Difficulty difficulty, Pageable pageable) {
    String normalized = search == null || search.isBlank() ? null : search.trim();
    return quizzes.search(QuizStatus.PUBLISHED, normalized, category, difficulty, pageable)
      .map(quiz -> QuizResponse.from(quiz, quizQuestions.countByQuizId(quiz.getId())));
  }

  public QuizResponse details(Long id) {
    Quiz quiz = quizzes.findById(id)
      .filter(value -> value.getStatus() == QuizStatus.PUBLISHED)
      .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Quiz not found."));
    return QuizResponse.from(quiz, quizQuestions.countByQuizId(id));
  }
}
