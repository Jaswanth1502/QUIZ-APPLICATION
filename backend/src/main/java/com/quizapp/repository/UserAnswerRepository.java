package com.quizapp.repository;
import com.quizapp.entity.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
  List<UserAnswer> findByAttemptId(Long attemptId);
  Optional<UserAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
}
