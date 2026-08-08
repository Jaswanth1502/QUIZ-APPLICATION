package com.quizapp.entity;

import com.quizapp.enums.Difficulty;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.*;

@Entity
@Table(name = "questions", indexes = @Index(name = "idx_questions_category_difficulty", columnList = "category_id,difficulty"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Question extends BaseEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Lob @Column(nullable = false)
  private String questionText;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "category_id")
  private Category category;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Difficulty difficulty;

  @Column(nullable = false, precision = 8, scale = 2)
  private BigDecimal marks;

  @Lob
  private String explanation;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "created_by")
  private User createdBy;

  @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("displayOrder asc")
  @Builder.Default
  private List<AnswerOption> options = new ArrayList<>();

  public void replaceOptions(List<AnswerOption> values) {
    options.clear();
    values.forEach(option -> {
      option.setQuestion(this);
      options.add(option);
    });
  }
}
