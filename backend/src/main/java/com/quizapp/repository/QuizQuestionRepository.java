package com.quizapp.repository;
import com.quizapp.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
  List<QuizQuestion> findByQuizIdOrderByQuestionOrder(Long quizId);
  long countByQuizId(Long quizId);
  boolean existsByQuizIdAndQuestionId(Long quizId, Long questionId);
  boolean existsByQuestionId(Long questionId);
  void deleteByQuizIdAndQuestionId(Long quizId, Long questionId);
  void deleteByQuestionId(Long questionId);
}
