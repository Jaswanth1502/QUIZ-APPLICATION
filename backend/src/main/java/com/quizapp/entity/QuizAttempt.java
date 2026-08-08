package com.quizapp.entity;

import com.quizapp.enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "quiz_attempts", indexes = {
  @Index(name = "idx_attempt_user_started", columnList = "user_id,started_at"),
  @Index(name = "idx_attempt_quiz_status", columnList = "quiz_id,status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizAttempt {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "quiz_id")
  private Quiz quiz;

  @Column(nullable = false)
  private Instant startedAt;

  private Instant submittedAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private AttemptStatus status;

  @Builder.Default private int totalQuestions = 0;
  @Builder.Default private int correctAnswers = 0;
  @Builder.Default private int incorrectAnswers = 0;
  @Builder.Default private int unansweredQuestions = 0;

  @Column(nullable = false, precision = 10, scale = 2)
  @Builder.Default
  private BigDecimal score = BigDecimal.ZERO;

  @Column(nullable = false, precision = 10, scale = 2)
  @Builder.Default
  private BigDecimal maximumScore = BigDecimal.ZERO;

  @Column(nullable = false, precision = 5, scale = 2)
  @Builder.Default
  private BigDecimal percentage = BigDecimal.ZERO;

  @Enumerated(EnumType.STRING)
  private ResultStatus resultStatus;

  @Builder.Default
  private long timeTakenSeconds = 0;
}
