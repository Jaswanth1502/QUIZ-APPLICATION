package com.quizapp.entity;

import com.quizapp.enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "quizzes", indexes = {
  @Index(name = "idx_quizzes_catalogue", columnList = "status,category_id,difficulty"),
  @Index(name = "idx_quizzes_title", columnList = "title")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Quiz extends BaseEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 180)
  private String title;

  @Lob
  private String description;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "category_id")
  private Category category;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Difficulty difficulty;

  @Column(nullable = false)
  private Integer durationMinutes;

  @Column(nullable = false, precision = 5, scale = 2)
  private BigDecimal passingPercentage;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @Builder.Default
  private QuizStatus status = QuizStatus.DRAFT;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "created_by")
  private User createdBy;
}
