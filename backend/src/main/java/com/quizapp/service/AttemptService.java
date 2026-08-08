package com.quizapp.service;

import com.quizapp.dto.request.SaveAnswerRequest;
import com.quizapp.dto.response.AttemptDtos;
import com.quizapp.entity.*;
import com.quizapp.enums.*;
import com.quizapp.exception.ApiException;
import com.quizapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AttemptService {
  private final CurrentUserService current;
  private final QuizRepository quizzes;
  private final QuizQuestionRepository quizQuestions;
  private final QuizAttemptRepository attempts;
  private final UserAnswerRepository answers;
  private final AnswerOptionRepository options;
  private final UserService userService;

  @Transactional
  public AttemptDtos.Start start(Long quizId) {
    User user = current.get();
    Quiz quiz = quizzes.findById(quizId)
      .filter(value -> value.getStatus() == QuizStatus.PUBLISHED)
      .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Only published quizzes can be started."));
    List<QuizQuestion> links = quizQuestions.findByQuizIdOrderByQuestionOrder(quizId);
    if (links.isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "This quiz has no questions.");
    }
    QuizAttempt attempt = attempts.save(QuizAttempt.builder()
      .user(user).quiz(quiz).startedAt(Instant.now())
      .status(AttemptStatus.IN_PROGRESS).totalQuestions(links.size()).build());
    return startDto(attempt, links);
  }

  @Transactional(readOnly = true)
  public AttemptDtos.Start active(Long id) {
    QuizAttempt attempt = owned(id);
    if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
      throw new ApiException(HttpStatus.CONFLICT, "Attempt is already completed.");
    }
    return startDto(attempt, quizQuestions.findByQuizIdOrderByQuestionOrder(attempt.getQuiz().getId()));
  }

  @Transactional
  public void save(Long attemptId, SaveAnswerRequest request) {
    QuizAttempt attempt = owned(attemptId);
    ensureEditable(attempt);
    Question question = quizQuestions.findByQuizIdOrderByQuestionOrder(attempt.getQuiz().getId()).stream()
      .map(QuizQuestion::getQuestion)
      .filter(value -> value.getId().equals(request.questionId()))
      .findFirst()
      .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Question does not belong to this quiz."));
    AnswerOption selected = request.selectedOptionId() == null ? null :
      options.findByIdAndQuestionId(request.selectedOptionId(), request.questionId())
        .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
          "Selected option does not belong to the question."));
    UserAnswer answer = answers.findByAttemptIdAndQuestionId(attemptId, request.questionId())
      .orElse(UserAnswer.builder().attempt(attempt).question(question).build());
    answer.setSelectedOption(selected);
    answer.setAnsweredAt(selected == null ? null : Instant.now());
    answer.setCorrect(null);
    answer.setMarksAwarded(BigDecimal.ZERO);
    answers.save(answer);
  }

  @Transactional
  public AttemptDtos.Result submit(Long id) {
    QuizAttempt attempt = owned(id);
    if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
      throw new ApiException(HttpStatus.CONFLICT, "Attempt is already completed.");
    }
    List<QuizQuestion> links = quizQuestions.findByQuizIdOrderByQuestionOrder(attempt.getQuiz().getId());
    Map<Long, UserAnswer> saved = new HashMap<>();
    answers.findByAttemptId(id).forEach(answer -> saved.put(answer.getQuestion().getId(), answer));

    BigDecimal score = BigDecimal.ZERO;
    BigDecimal maximum = BigDecimal.ZERO;
    int correct = 0, incorrect = 0, unanswered = 0;

    for (QuizQuestion link : links) {
      Question question = link.getQuestion();
      maximum = maximum.add(question.getMarks());
      UserAnswer answer = saved.get(question.getId());
      if (answer == null || answer.getSelectedOption() == null) {
        unanswered++;
        continue;
      }
      boolean isCorrect = answer.getSelectedOption().isCorrect();
      answer.setCorrect(isCorrect);
      answer.setMarksAwarded(isCorrect ? question.getMarks() : BigDecimal.ZERO);
      answers.save(answer);
      if (isCorrect) {
        correct++;
        score = score.add(question.getMarks());
      } else {
        incorrect++;
      }
    }

    BigDecimal percentage = maximum.signum() == 0 ? BigDecimal.ZERO :
      score.multiply(BigDecimal.valueOf(100)).divide(maximum, 2, RoundingMode.HALF_UP);
    Instant submitted = Instant.now();
    boolean expired = submitted.isAfter(expiresAt(attempt));

    attempt.setSubmittedAt(submitted);
    attempt.setStatus(expired ? AttemptStatus.EXPIRED : AttemptStatus.SUBMITTED);
    attempt.setCorrectAnswers(correct);
    attempt.setIncorrectAnswers(incorrect);
    attempt.setUnansweredQuestions(unanswered);
    attempt.setScore(score);
    attempt.setMaximumScore(maximum);
    attempt.setPercentage(percentage);
    attempt.setResultStatus(
      percentage.compareTo(attempt.getQuiz().getPassingPercentage()) >= 0 ? ResultStatus.PASS : ResultStatus.FAIL);
    attempt.setTimeTakenSeconds(Math.max(0, Duration.between(attempt.getStartedAt(), submitted).toSeconds()));
    attempts.save(attempt);
    return userService.result(attempt);
  }

  @Transactional(readOnly = true)
  public AttemptDtos.Result result(Long id) {
    QuizAttempt attempt = owned(id);
    if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
      throw new ApiException(HttpStatus.CONFLICT, "Attempt has not been submitted.");
    }
    return userService.result(attempt);
  }

  @Transactional(readOnly = true)
  public AttemptDtos.Review review(Long id) {
    QuizAttempt attempt = owned(id);
    if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
      throw new ApiException(HttpStatus.CONFLICT, "Review is available after submission.");
    }
    Map<Long, UserAnswer> saved = new HashMap<>();
    answers.findByAttemptId(id).forEach(answer -> saved.put(answer.getQuestion().getId(), answer));
    List<AttemptDtos.ReviewQuestion> review = quizQuestions
      .findByQuizIdOrderByQuestionOrder(attempt.getQuiz().getId()).stream()
      .map(link -> {
        Question question = link.getQuestion();
        UserAnswer answer = saved.get(question.getId());
        AnswerOption chosen = answer == null ? null : answer.getSelectedOption();
        String correctText = question.getOptions().stream().filter(AnswerOption::isCorrect)
          .map(AnswerOption::getOptionText).findFirst().orElse("");
        return new AttemptDtos.ReviewQuestion(
          question.getId(), question.getQuestionText(),
          chosen == null ? null : chosen.getId(),
          chosen == null ? null : chosen.getOptionText(),
          correctText,
          answer != null && Boolean.TRUE.equals(answer.getCorrect()),
          answer == null ? BigDecimal.ZERO : answer.getMarksAwarded(),
          question.getExplanation()
        );
      }).toList();
    return new AttemptDtos.Review(id, attempt.getQuiz().getTitle(), review);
  }

  private AttemptDtos.Start startDto(QuizAttempt attempt, List<QuizQuestion> links) {
    Map<Long, Long> selected = new HashMap<>();
    answers.findByAttemptId(attempt.getId()).forEach(answer ->
      selected.put(answer.getQuestion().getId(),
        answer.getSelectedOption() == null ? null : answer.getSelectedOption().getId()));

    List<AttemptDtos.Question> questions = links.stream().map(link -> {
      Question question = link.getQuestion();
      List<AttemptDtos.Option> publicOptions = question.getOptions().stream()
        .map(option -> new AttemptDtos.Option(option.getId(), option.getOptionText(), option.getDisplayOrder()))
        .toList();
      return new AttemptDtos.Question(question.getId(), question.getQuestionText(),
        question.getMarks(), publicOptions, selected.get(question.getId()));
    }).toList();

    return new AttemptDtos.Start(attempt.getId(), attempt.getQuiz().getId(),
      attempt.getQuiz().getTitle(), attempt.getStartedAt(), expiresAt(attempt), questions);
  }

  private QuizAttempt owned(Long id) {
    User user = current.get();
    return attempts.findByIdAndUserId(id, user.getId())
      .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Attempt not found."));
  }

  private void ensureEditable(QuizAttempt attempt) {
    if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
      throw new ApiException(HttpStatus.CONFLICT, "Attempt is already completed.");
    }
    if (Instant.now().isAfter(expiresAt(attempt))) {
      throw new ApiException(HttpStatus.CONFLICT, "The quiz time has expired. Submit the attempt.");
    }
  }

  private Instant expiresAt(QuizAttempt attempt) {
    return attempt.getStartedAt().plus(Duration.ofMinutes(attempt.getQuiz().getDurationMinutes()));
  }
}
