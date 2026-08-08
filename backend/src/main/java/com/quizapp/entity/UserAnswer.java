package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "user_answers",
  uniqueConstraints = @UniqueConstraint(name = "uq_attempt_question", columnNames = {"attempt_id", "question_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserAnswer {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "attempt_id")
  private QuizAttempt attempt;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "question_id")
  private Question question;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "selected_option_id")
  private AnswerOption selectedOption;

  private Boolean correct;

  @Column(nullable = false, precision = 8, scale = 2)
  @Builder.Default
  private BigDecimal marksAwarded = BigDecimal.ZERO;

  private Instant answeredAt;
}
