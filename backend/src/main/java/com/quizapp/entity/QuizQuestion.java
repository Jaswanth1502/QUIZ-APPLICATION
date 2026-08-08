package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quiz_questions", uniqueConstraints = {
  @UniqueConstraint(name = "uq_quiz_question", columnNames = {"quiz_id", "question_id"}),
  @UniqueConstraint(name = "uq_quiz_question_order", columnNames = {"quiz_id", "question_order"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizQuestion {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "quiz_id")
  private Quiz quiz;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "question_id")
  private Question question;

  @Column(nullable = false)
  private int questionOrder;
}
