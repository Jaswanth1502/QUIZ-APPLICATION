package com.quizapp.repository;
import com.quizapp.entity.User;
import com.quizapp.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByUsernameIgnoreCase(String username);
  Optional<User> findByEmailIgnoreCase(String email);
  Optional<User> findByUsernameIgnoreCaseOrEmailIgnoreCase(String username, String email);
  boolean existsByUsernameIgnoreCase(String username);
  boolean existsByEmailIgnoreCase(String email);
  long countByAccountStatus(AccountStatus status);
}
