package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "answer_options",
  uniqueConstraints = @UniqueConstraint(name = "uq_question_option_order", columnNames = {"question_id", "display_order"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnswerOption {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "question_id")
  private Question question;

  @Column(nullable = false, length = 600)
  private String optionText;

  @Column(name = "is_correct", nullable = false)
  private boolean correct;

  @Column(nullable = false)
  private int displayOrder;
}
