package com.quizapp.service;

import com.quizapp.dto.request.*;
import com.quizapp.dto.response.*;
import com.quizapp.entity.*;
import com.quizapp.exception.ApiException;
import com.quizapp.enums.AttemptStatus;
import com.quizapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
  private final CurrentUserService current;
  private final UserRepository users;
  private final QuizAttemptRepository attempts;
  private final PasswordEncoder encoder;

  public UserResponse me() {
    return UserResponse.from(current.get());
  }

  @Transactional
  public UserResponse update(ProfileUpdateRequest request) {
    User user = current.get();
    users.findByEmailIgnoreCase(request.email())
      .filter(existing -> !existing.getId().equals(user.getId()))
      .ifPresent(existing -> { throw new ApiException(HttpStatus.CONFLICT, "Email is already registered."); });
    user.setFullName(request.fullName().trim());
    user.setEmail(request.email().trim().toLowerCase());
    return UserResponse.from(users.save(user));
  }

  @Transactional
  public void password(PasswordUpdateRequest request) {
    User user = current.get();
    if (!encoder.matches(request.currentPassword(), user.getPasswordHash())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect.");
    }
    user.setPasswordHash(encoder.encode(request.newPassword()));
    users.save(user);
  }

  public Page<AttemptDtos.Result> history(Pageable pageable) {
    User user = current.get();
    return attempts.findByUserIdAndStatusNotOrderByStartedAtDesc(user.getId(), AttemptStatus.IN_PROGRESS, pageable).map(this::result);
  }

  public DashboardResponse dashboard() {
    User user = current.get();
    List<QuizAttempt> all = attempts.findByUserIdAndStatusNotOrderByStartedAtDesc(
      user.getId(), AttemptStatus.IN_PROGRESS, PageRequest.of(0, 1000)).getContent();
    double average = all.stream().mapToDouble(a -> a.getPercentage().doubleValue()).average().orElse(0);
    double best = all.stream().mapToDouble(a -> a.getPercentage().doubleValue()).max().orElse(0);
    List<Map<String, Object>> recent = all.stream().limit(5).map(attempt -> {
      Map<String, Object> row = new LinkedHashMap<>();
      row.put("id", attempt.getId());
      row.put("quiz", attempt.getQuiz().getTitle());
      row.put("percentage", attempt.getPercentage());
      row.put("status", attempt.getResultStatus() == null ? "IN_PROGRESS" : attempt.getResultStatus().name());
      return row;
    }).toList();
    return new DashboardResponse(
      Map.of("completedQuizzes", all.stream().filter(a -> a.getResultStatus() != null).count(),
        "averageScore", Math.round(average * 100) / 100.0,
        "bestScore", best),
      recent,
      List.of()
    );
  }

  public AttemptDtos.Result result(QuizAttempt attempt) {
    return new AttemptDtos.Result(
      attempt.getId(), attempt.getQuiz().getTitle(), attempt.getUser().getFullName(),
      attempt.getScore(), attempt.getMaximumScore(), attempt.getPercentage(),
      attempt.getTotalQuestions(), attempt.getCorrectAnswers(), attempt.getIncorrectAnswers(),
      attempt.getUnansweredQuestions(), attempt.getQuiz().getPassingPercentage(),
      attempt.getResultStatus() == null ? null : attempt.getResultStatus().name(),
      attempt.getTimeTakenSeconds()
    );
  }
}
