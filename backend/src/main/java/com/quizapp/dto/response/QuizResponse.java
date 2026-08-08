package com.quizapp.dto.response;
import com.quizapp.entity.Quiz;
import java.math.BigDecimal;
public record QuizResponse(
  Long id, String title, String description, Long categoryId, String category,
  String difficulty, Integer durationMinutes, BigDecimal passingPercentage,
  String status, long questionCount
) {
  public static QuizResponse from(Quiz quiz, long count) {
    return new QuizResponse(
      quiz.getId(), quiz.getTitle(), quiz.getDescription(),
      quiz.getCategory().getId(), quiz.getCategory().getName(),
      quiz.getDifficulty().name(), quiz.getDurationMinutes(),
      quiz.getPassingPercentage(), quiz.getStatus().name(), count
    );
  }
}
