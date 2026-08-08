package com.quizapp.service;

import com.quizapp.dto.request.*;
import com.quizapp.dto.response.*;
import com.quizapp.entity.*;
import com.quizapp.enums.*;
import com.quizapp.exception.ApiException;
import com.quizapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {
  private final CategoryRepository categories;
  private final QuizRepository quizzes;
  private final QuestionRepository questions;
  private final QuizQuestionRepository quizQuestions;
  private final UserRepository users;
  private final QuizAttemptRepository attempts;
  private final CurrentUserService current;

  public Page<CategoryResponse> categories(Pageable pageable) {
    return categories.findAll(pageable).map(CategoryResponse::from);
  }

  @Transactional
  public CategoryResponse createCategory(CategoryRequest request) {
    if (categories.existsByNameIgnoreCase(request.name())) {
      throw new ApiException(HttpStatus.CONFLICT, "Category name already exists.");
    }
    return CategoryResponse.from(categories.save(Category.builder()
      .name(request.name().trim()).description(request.description())
      .status(CategoryStatus.ACTIVE).build()));
  }

  @Transactional
  public CategoryResponse updateCategory(Long id, CategoryRequest request) {
    Category category = category(id);
    category.setName(request.name().trim());
    category.setDescription(request.description());
    return CategoryResponse.from(categories.save(category));
  }

  @Transactional
  public void categoryStatus(Long id, CategoryStatus status) {
    Category category = category(id);
    category.setStatus(status);
    categories.save(category);
  }

  @Transactional
  public void deleteCategory(Long id) {
    categoryStatus(id, CategoryStatus.INACTIVE);
  }

  public Page<QuizResponse> quizzes(Pageable pageable) {
    return quizzes.findAll(pageable)
      .map(quiz -> QuizResponse.from(quiz, quizQuestions.countByQuizId(quiz.getId())));
  }

  public QuizResponse quiz(Long id) {
    Quiz quiz = quizzes.findById(id)
      .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Quiz not found."));
    return QuizResponse.from(quiz, quizQuestions.countByQuizId(id));
  }

  @Transactional
  public QuizResponse createQuiz(QuizRequest request) {
    Quiz quiz = Quiz.builder()
      .title(request.title().trim())
      .description(request.description())
      .category(category(request.categoryId()))
      .difficulty(request.difficulty())
      .durationMinutes(request.durationMinutes())
      .passingPercentage(request.passingPercentage())
      .status(QuizStatus.DRAFT)
      .createdBy(current.get())
      .build();
    quiz = quizzes.save(quiz);
    return QuizResponse.from(quiz, 0);
  }

  @Transactional
  public QuizResponse updateQuiz(Long id, QuizRequest request) {
    Quiz quiz = quizzes.findById(id)
      .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Quiz not found."));
    quiz.setTitle(request.title().trim());
    quiz.setDescription(request.description());
    quiz.setCategory(category(request.categoryId()));
    quiz.setDifficulty(request.difficulty());
    quiz.setDurationMinutes(request.durationMinutes());
    quiz.setPassingPercentage(request.passingPercentage());
    quiz = quizzes.save(quiz);
    return QuizResponse.from(quiz, quizQuestions.countByQuizId(id));
  }

  @Transactional
  public void quizStatus(Long id, QuizStatus status) {
    Quiz quiz = quizzes.findById(id)
      .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Quiz not found."));
    if (status == QuizStatus.PUBLISHED && quizQuestions.countByQuizId(id) < 1) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Add at least one question before publishing.");
    }
    quiz.setStatus(status);
    quizzes.save(quiz);
  }

  @Transactional
  public void deleteQuiz(Long id) {
    quizStatus(id, QuizStatus.INACTIVE);
  }

  @Transactional
  public void addQuestion(Long quizId, Long questionId) {
    Quiz quiz = quizzes.findById(quizId)
      .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Quiz not found."));
    Question question = questions.findById(questionId)
      .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found."));
    if (quizQuestions.existsByQuizIdAndQuestionId(quizId, questionId)) return;
    quizQuestions.save(QuizQuestion.builder()
      .quiz(quiz).question(question)
      .questionOrder((int) quizQuestions.countByQuizId(quizId) + 1).build());
  }

  @Transactional
  public void removeQuestion(Long quizId, Long questionId) {
    quizQuestions.deleteByQuizIdAndQuestionId(quizId, questionId);
  }

  public Page<Map<String, Object>> questionList(Pageable pageable) {
    return questions.findAll(pageable).map(this::questionMap);
  }

  public Map<String, Object> question(Long id) {
    return questionMap(questions.findById(id)
      .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found.")));
  }

  @Transactional
  public Map<String, Object> createQuestion(QuestionRequest request) {
    validateQuestion(request);
    Question question = Question.builder()
      .questionText(request.questionText().trim())
      .category(category(request.categoryId()))
      .difficulty(request.difficulty())
      .marks(request.marks())
      .explanation(request.explanation())
      .createdBy(current.get())
      .build();
    question.replaceOptions(request.options().stream().map(option ->
      AnswerOption.builder().optionText(option.optionText().trim()).correct(option.correct())
        .displayOrder(option.displayOrder()).build()).toList());
    return questionMap(questions.save(question));
  }

  @Transactional
  public Map<String, Object> updateQuestion(Long id, QuestionRequest request) {
    validateQuestion(request);
    Question question = questions.findById(id)
      .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found."));
    question.setQuestionText(request.questionText().trim());
    question.setCategory(category(request.categoryId()));
    question.setDifficulty(request.difficulty());
    question.setMarks(request.marks());
    question.setExplanation(request.explanation());
    question.replaceOptions(request.options().stream().map(option ->
      AnswerOption.builder().optionText(option.optionText().trim()).correct(option.correct())
        .displayOrder(option.displayOrder()).build()).toList());
    return questionMap(questions.save(question));
  }

  @Transactional
  public void deleteQuestion(Long id) {
    quizQuestions.deleteByQuestionId(id);
    questions.deleteById(id);
  }


  public List<Map<String, Object>> quizQuestionList(Long quizId) {
    if (!quizzes.existsById(quizId)) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Quiz not found.");
    }
    return quizQuestions.findByQuizIdOrderByQuestionOrder(quizId).stream()
      .map(link -> {
        Map<String, Object> item = new LinkedHashMap<>(questionMap(link.getQuestion()));
        item.put("questionOrder", link.getQuestionOrder());
        return item;
      }).toList();
  }

  public Map<String, Object> quizStatistics(Long quizId) {
    Quiz quiz = quizzes.findById(quizId)
      .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Quiz not found."));
    List<QuizAttempt> completed = attempts.findByQuizIdAndStatusNot(
      quizId, AttemptStatus.IN_PROGRESS);
    double average = completed.stream().mapToDouble(a -> a.getPercentage().doubleValue())
      .average().orElse(0);
    double highest = completed.stream().mapToDouble(a -> a.getPercentage().doubleValue())
      .max().orElse(0);
    long passes = completed.stream().filter(a -> a.getResultStatus() == ResultStatus.PASS).count();
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("quizId", quizId);
    result.put("quizTitle", quiz.getTitle());
    result.put("attempts", completed.size());
    result.put("averageScore", Math.round(average * 100) / 100.0);
    result.put("highestScore", Math.round(highest * 100) / 100.0);
    result.put("passRate", completed.isEmpty() ? 0 :
      Math.round(passes * 10000.0 / completed.size()) / 100.0);
    return result;
  }

  public Page<UserResponse> userList(Pageable pageable) {
    return users.findAll(pageable).map(UserResponse::from);
  }

  public Map<String, Object> userAnalytics(Long userId) {
    User user = users.findById(userId)
      .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));

    List<QuizAttempt> userAttempts = attempts.findByUserIdAndStatusNot(userId, AttemptStatus.IN_PROGRESS);

    long totalAttempts = userAttempts.size();
    long passedAttempts = userAttempts.stream()
      .filter(a -> a.getResultStatus() == ResultStatus.PASS).count();
    long failedAttempts = userAttempts.stream()
      .filter(a -> a.getResultStatus() == ResultStatus.FAIL).count();

    double passRate = totalAttempts > 0 ? ((double) passedAttempts / totalAttempts) * 100.0 : 0.0;
    double avgScore = userAttempts.stream()
      .mapToDouble(a -> a.getPercentage() == null ? 0.0 : a.getPercentage().doubleValue())
      .average().orElse(0.0);

    Map<String, List<QuizAttempt>> byQuiz = new LinkedHashMap<>();
    for (QuizAttempt attempt : userAttempts) {
      String title = (attempt.getQuiz() != null && attempt.getQuiz().getTitle() != null)
        ? attempt.getQuiz().getTitle()
        : "Quiz";
      byQuiz.computeIfAbsent(title, k -> new ArrayList<>()).add(attempt);
    }

    List<Map<String, Object>> quizBreakdown = new ArrayList<>();
    for (Map.Entry<String, List<QuizAttempt>> entry : byQuiz.entrySet()) {
      List<QuizAttempt> list = entry.getValue();
      double qAvgScore = list.stream()
        .mapToDouble(a -> a.getPercentage() == null ? 0.0 : a.getPercentage().doubleValue())
        .average().orElse(0.0);
      long qPassed = list.stream().filter(a -> a.getResultStatus() == ResultStatus.PASS).count();
      Map<String, Object> qItem = new LinkedHashMap<>();
      qItem.put("quizTitle", entry.getKey());
      qItem.put("attempts", list.size());
      qItem.put("avgScore", Math.round(qAvgScore * 10.0) / 10.0);
      qItem.put("passed", qPassed);
      qItem.put("failed", list.size() - qPassed);
      quizBreakdown.add(qItem);
    }

    List<Map<String, Object>> recentAttempts = userAttempts.stream()
      .sorted((a, b) -> {
        if (a.getSubmittedAt() == null || b.getSubmittedAt() == null) return 0;
        return b.getSubmittedAt().compareTo(a.getSubmittedAt());
      })
      .limit(10)
      .map(a -> {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("attemptId", a.getId());
        item.put("quizTitle", (a.getQuiz() != null && a.getQuiz().getTitle() != null) ? a.getQuiz().getTitle() : "Quiz");
        item.put("percentage", a.getPercentage() == null ? 0.0 : a.getPercentage());
        item.put("score", a.getScore());
        item.put("maximumScore", a.getMaximumScore());
        item.put("correctAnswers", a.getCorrectAnswers());
        item.put("totalQuestions", a.getTotalQuestions());
        item.put("status", a.getResultStatus() != null ? a.getResultStatus().name() : "COMPLETED");
        item.put("submittedAt", a.getSubmittedAt());
        item.put("timeTakenSeconds", a.getTimeTakenSeconds());
        return item;
      })
      .toList();

    Map<String, Object> result = new LinkedHashMap<>();
    result.put("userId", user.getId());
    result.put("fullName", user.getFullName() == null ? "" : user.getFullName());
    result.put("username", user.getUsername());
    result.put("email", user.getEmail());
    result.put("roles", user.getRoles().stream().map(Role::getName).toList());
    result.put("status", user.getAccountStatus() != null ? user.getAccountStatus().name() : "ACTIVE");
    result.put("totalAttempts", totalAttempts);
    result.put("passedAttempts", passedAttempts);
    result.put("failedAttempts", failedAttempts);
    result.put("passRate", Math.round(passRate * 10.0) / 10.0);
    result.put("averageScore", Math.round(avgScore * 10.0) / 10.0);
    result.put("quizBreakdown", quizBreakdown);
    result.put("recentAttempts", recentAttempts);

    return result;
  }

  @Transactional
  public void userStatus(Long id, AccountStatus status) {
    User user = users.findById(id)
      .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));
    user.setAccountStatus(status);
    users.save(user);
  }

  public Page<AttemptDtos.Result> attemptList(Pageable pageable) {
    return attempts.findAll(pageable).map(this::attemptResult);
  }

  public DashboardResponse dashboard() {
    long total = attempts.count();
    double average = Optional.ofNullable(attempts.averageScore()).orElse(0d);
    long pass = attempts.passCount();
    double rate = total == 0 ? 0 : pass * 100.0 / total;

    Map<String, Object> stats = new LinkedHashMap<>();
    stats.put("totalUsers", users.count());
    stats.put("activeUsers", users.countByAccountStatus(AccountStatus.ACTIVE));
    stats.put("totalQuizzes", quizzes.count());
    stats.put("publishedQuizzes", quizzes.countByStatus(QuizStatus.PUBLISHED));
    stats.put("totalQuestions", questions.count());
    stats.put("totalAttempts", total);
    stats.put("averageScore", Math.round(average * 100) / 100.0);
    stats.put("passRate", Math.round(rate * 100) / 100.0);

    List<Map<String, Object>> chart = attempts.quizPerformance(PageRequest.of(0, 5)).stream()
      .map(value -> Map.<String, Object>of(
        "name", value[0],
        "attempts", value[1],
        "averageScore", Math.round(((Number) value[2]).doubleValue() * 100) / 100.0
      )).toList();
    List<Map<String, Object>> recent = attempts
      .findTop5ByStatusNotOrderBySubmittedAtDesc(AttemptStatus.IN_PROGRESS).stream()
      .map(attempt -> Map.<String, Object>of(
        "id", attempt.getId(),
        "user", attempt.getUser().getFullName(),
        "quiz", attempt.getQuiz().getTitle(),
        "percentage", attempt.getPercentage(),
        "status", attempt.getResultStatus().name()
      )).toList();
    return new DashboardResponse(stats, recent, chart);
  }

  private Category category(Long id) {
    return categories.findById(id)
      .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found."));
  }

  private void validateQuestion(QuestionRequest request) {
    long correct = request.options().stream().filter(QuestionRequest.OptionRequest::correct).count();
    if (request.options().size() < 4 || correct != 1) {
      throw new ApiException(HttpStatus.BAD_REQUEST,
        "A question requires at least four options and exactly one correct option.");
    }
  }

  private Map<String, Object> questionMap(Question question) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("id", question.getId());
    result.put("questionText", question.getQuestionText());
    result.put("categoryId", question.getCategory().getId());
    result.put("category", question.getCategory().getName());
    result.put("difficulty", question.getDifficulty());
    result.put("marks", question.getMarks());
    result.put("explanation", question.getExplanation() == null ? "" : question.getExplanation());
    result.put("options", question.getOptions().stream().map(option ->
      Map.of("id", option.getId(), "optionText", option.getOptionText(),
        "correct", option.isCorrect(), "displayOrder", option.getDisplayOrder())).toList());
    return result;
  }

  private AttemptDtos.Result attemptResult(QuizAttempt attempt) {
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
