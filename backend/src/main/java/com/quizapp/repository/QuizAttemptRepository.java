package com.quizapp.repository;
import com.quizapp.entity.QuizAttempt;
import com.quizapp.enums.AttemptStatus;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import java.util.*;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
  Page<QuizAttempt> findByUserIdOrderByStartedAtDesc(Long userId, Pageable pageable);
  Page<QuizAttempt> findByUserIdAndStatusNotOrderByStartedAtDesc(
    Long userId, AttemptStatus status, Pageable pageable);
  Optional<QuizAttempt> findByIdAndUserId(Long id, Long userId);
  List<QuizAttempt> findByUserIdAndStatusNot(Long userId, AttemptStatus status);
  List<QuizAttempt> findByQuizIdAndStatusNot(Long quizId, AttemptStatus status);
  List<QuizAttempt> findTop5ByStatusNotOrderBySubmittedAtDesc(AttemptStatus status);

  @Query("""
    select coalesce(avg(a.percentage), 0)
    from QuizAttempt a
    where a.status <> com.quizapp.enums.AttemptStatus.IN_PROGRESS
    """)
  Double averageScore();

  @Query("""
    select count(a)
    from QuizAttempt a
    where a.status <> com.quizapp.enums.AttemptStatus.IN_PROGRESS
      and a.resultStatus = com.quizapp.enums.ResultStatus.PASS
    """)
  long passCount();

  @Query("""
    select a.quiz.title, count(a), coalesce(avg(a.percentage), 0)
    from QuizAttempt a
    where a.status <> com.quizapp.enums.AttemptStatus.IN_PROGRESS
    group by a.quiz.id, a.quiz.title
    order by count(a) desc
    """)
  List<Object[]> quizPerformance(Pageable pageable);
}
