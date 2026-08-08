package com.quizapp.repository;
import com.quizapp.entity.AnswerOption;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface AnswerOptionRepository extends JpaRepository<AnswerOption, Long> {
  Optional<AnswerOption> findByIdAndQuestionId(Long id, Long questionId);
}
