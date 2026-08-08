package com.quizapp.repository;
import com.quizapp.entity.Quiz;
import com.quizapp.enums.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
  @Query("""
      select q from Quiz q
      where q.status = :status
        and (:search is null or lower(q.title) like lower(concat('%', :search, '%')))
        and (:category is null or q.category.id = :category)
        and (:difficulty is null or q.difficulty = :difficulty)
      """)
  Page<Quiz> search(@Param("status") QuizStatus status,
                    @Param("search") String search,
                    @Param("category") Long category,
                    @Param("difficulty") Difficulty difficulty,
                    Pageable pageable);

  long countByStatus(QuizStatus status);
}
