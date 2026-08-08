package com.quizapp.dto.response;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class AttemptDtos {
  private AttemptDtos() {}

  public record Option(Long id, String text, int order) {}
  public record Question(Long id, String text, BigDecimal marks, List<Option> options, Long selectedOptionId) {}
  public record Start(Long attemptId, Long quizId, String quizTitle, Instant startedAt, Instant expiresAt, List<Question> questions) {}
  public record Result(
    Long attemptId, String quizTitle, String userName,
    BigDecimal score, BigDecimal maximumScore, BigDecimal percentage,
    int totalQuestions, int correctAnswers, int incorrectAnswers, int unansweredQuestions,
    BigDecimal passingPercentage, String status, long timeTakenSeconds
  ) {}
  public record ReviewQuestion(
    Long questionId, String questionText, Long selectedOptionId, String selectedOption,
    String correctOption, boolean correct, BigDecimal marksAwarded, String explanation
  ) {}
  public record Review(Long attemptId, String quizTitle, List<ReviewQuestion> questions) {}
}
