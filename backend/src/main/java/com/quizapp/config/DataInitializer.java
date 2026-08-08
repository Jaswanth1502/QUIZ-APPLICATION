package com.quizapp.config;

import com.quizapp.entity.*;
import com.quizapp.enums.*;
import com.quizapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {
  private final RoleRepository roles;
  private final UserRepository users;
  private final CategoryRepository categories;
  private final QuestionRepository questions;
  private final QuizRepository quizzes;
  private final QuizQuestionRepository quizQuestions;
  private final QuizAttemptRepository attempts;
  private final PasswordEncoder encoder;

  private record OptionData(String text, boolean correct) {}
  private record QuestionSeedData(
      String questionText,
      Difficulty difficulty,
      BigDecimal marks,
      String explanation,
      List<OptionData> options
  ) {}

  @Override
  public void run(String... args) {
    Role userRole = roles.findByName("ROLE_USER")
      .orElseGet(() -> roles.save(Role.builder().name("ROLE_USER").build()));
    Role adminRole = roles.findByName("ROLE_ADMIN")
      .orElseGet(() -> roles.save(Role.builder().name("ROLE_ADMIN").build()));

    User admin = user("admin", "admin@quizforge.local", "Quiz Administrator",
      "Admin@12345", new HashSet<>(Set.of(userRole, adminRole)));
    User alice = user("alice", "alice@example.com", "Alice Johnson",
      "User@12345", new HashSet<>(Set.of(userRole)));
    User bob = user("bob", "bob@example.com", "Bob Singh",
      "User@12345", new HashSet<>(Set.of(userRole)));

    if (categories.count() > 0) return;

    // Define 5 real quiz subjects with realistic questions & options
    Map<String, List<QuestionSeedData>> quizData = Map.of(
      "Java", List.of(
        new QuestionSeedData(
          "Which component of Java is responsible for compiling Java source code into bytecode?",
          Difficulty.EASY, BigDecimal.valueOf(1),
          "The JDK contains tools like javac to compile .java source files into JVM bytecode .class files.",
          List.of(
            new OptionData("JDK (Java Development Kit)", true),
            new OptionData("JRE (Java Runtime Environment)", false),
            new OptionData("JVM (Java Virtual Machine)", false),
            new OptionData("JIT (Just-In-Time Compiler)", false)
          )
        ),
        new QuestionSeedData(
          "Which of the following is NOT a primitive data type in Java?",
          Difficulty.EASY, BigDecimal.valueOf(1),
          "String is a reference class type in Java, whereas int, boolean, and double are primitive types.",
          List.of(
            new OptionData("int", false),
            new OptionData("String", true),
            new OptionData("boolean", false),
            new OptionData("double", false)
          )
        ),
        new QuestionSeedData(
          "What keyword is used to prevent a method from being overridden in a subclass?",
          Difficulty.MEDIUM, BigDecimal.valueOf(2),
          "Declaring a method as final prevents any subclass from overriding its implementation.",
          List.of(
            new OptionData("static", false),
            new OptionData("abstract", false),
            new OptionData("final", true),
            new OptionData("synchronized", false)
          )
        ),
        new QuestionSeedData(
          "What is the default value of an uninitialized local variable in Java?",
          Difficulty.MEDIUM, BigDecimal.valueOf(2),
          "Local variables in Java do not get default values and cause a compilation error if accessed uninitialized.",
          List.of(
            new OptionData("null", false),
            new OptionData("0", false),
            new OptionData("false", false),
            new OptionData("No default value (causes compilation error)", true)
          )
        ),
        new QuestionSeedData(
          "Which collection interface in Java guarantees unique elements without duplicate values?",
          Difficulty.HARD, BigDecimal.valueOf(3),
          "The Set interface models a collection containing no duplicate elements.",
          List.of(
            new OptionData("List", false),
            new OptionData("Set", true),
            new OptionData("Queue", false),
            new OptionData("Map", false)
          )
        )
      ),

      "React", List.of(
        new QuestionSeedData(
          "Which React hook is primarily used for managing component local state?",
          Difficulty.EASY, BigDecimal.valueOf(1),
          "useState allows functional components to declare and update local state variables.",
          List.of(
            new OptionData("useEffect", false),
            new OptionData("useState", true),
            new OptionData("useContext", false),
            new OptionData("useReducer", false)
          )
        ),
        new QuestionSeedData(
          "What is the Virtual DOM in React?",
          Difficulty.EASY, BigDecimal.valueOf(1),
          "React maintains a Virtual DOM tree in memory to calculate minimal updates for fast browser rendering.",
          List.of(
            new OptionData("A physical DOM node created directly in web browsers", false),
            new OptionData("A lightweight in-memory copy of the real DOM used for fast diffing", true),
            new OptionData("A browser DevTools extension", false),
            new OptionData("A database representation of component state", false)
          )
        ),
        new QuestionSeedData(
          "How do you pass data from a parent component down to a child component in React?",
          Difficulty.MEDIUM, BigDecimal.valueOf(2),
          "Properties (props) are passed down into child components like custom HTML attributes.",
          List.of(
            new OptionData("State", false),
            new OptionData("Props", true),
            new OptionData("Redux", false),
            new OptionData("Effects", false)
          )
        ),
        new QuestionSeedData(
          "When does the cleanup function returned inside useEffect run?",
          Difficulty.MEDIUM, BigDecimal.valueOf(2),
          "The return function inside useEffect acts as a cleanup routine executed before unmounting or re-running the effect.",
          List.of(
            new OptionData("Before the component renders for the first time", false),
            new OptionData("Right before the component unmounts or before re-executing the effect", true),
            new OptionData("Every time the user clicks on a button", false),
            new OptionData("Only when an error occurs during rendering", false)
          )
        ),
        new QuestionSeedData(
          "Why should unique 'key' props be provided when rendering dynamic lists in React?",
          Difficulty.HARD, BigDecimal.valueOf(3),
          "Keys give list items a stable identity so React can perform accurate reconciliation when items change.",
          List.of(
            new OptionData("To style list items with custom CSS classes", false),
            new OptionData("To help React identify which items changed, were added, or removed efficiently", true),
            new OptionData("To automatically sort items alphabetically", false),
            new OptionData("Keys are required for backend database queries", false)
          )
        )
      ),

      "Spring Boot", List.of(
        new QuestionSeedData(
          "Which annotation marks the main entry point class of a Spring Boot application?",
          Difficulty.EASY, BigDecimal.valueOf(1),
          "@SpringBootApplication combines @Configuration, @EnableAutoConfiguration, and @ComponentScan.",
          List.of(
            new OptionData("@EnableAutoConfiguration", false),
            new OptionData("@ComponentScan", false),
            new OptionData("@SpringBootApplication", true),
            new OptionData("@Configuration", false)
          )
        ),
        new QuestionSeedData(
          "What is the primary purpose of Spring Boot Starter dependencies?",
          Difficulty.EASY, BigDecimal.valueOf(1),
          "Starters provide pre-configured sets of transitive dependencies for specific tasks like web or JPA.",
          List.of(
            new OptionData("To auto-generate REST endpoints", false),
            new OptionData("To provide convenient, pre-configured sets of transitive dependencies", true),
            new OptionData("To replace configuration files", false),
            new OptionData("To compile Java classes into JAR files", false)
          )
        ),
        new QuestionSeedData(
          "Which Spring MVC annotation binds HTTP GET requests to a controller method?",
          Difficulty.MEDIUM, BigDecimal.valueOf(2),
          "@GetMapping is a shortcut annotation for @RequestMapping(method = RequestMethod.GET).",
          List.of(
            new OptionData("@PostMapping", false),
            new OptionData("@GetMapping", true),
            new OptionData("@PutMapping", false),
            new OptionData("@DeleteMapping", false)
          )
        ),
        new QuestionSeedData(
          "Where are application configuration properties typically declared in Spring Boot?",
          Difficulty.MEDIUM, BigDecimal.valueOf(2),
          "Spring Boot automatically loads configuration properties from application.properties or application.yml.",
          List.of(
            new OptionData("pom.xml", false),
            new OptionData("application.properties or application.yml", true),
            new OptionData("web.xml", false),
            new OptionData("Index.java", false)
          )
        ),
        new QuestionSeedData(
          "Which annotation injects dependencies automatically into Spring beans?",
          Difficulty.HARD, BigDecimal.valueOf(3),
          "@Autowired marks a constructor, field, or setter method to be injected by Spring's Dependency Injection facility.",
          List.of(
            new OptionData("@Autowired", true),
            new OptionData("@InjectBean", false),
            new OptionData("@ResourceBean", false),
            new OptionData("@Component", false)
          )
        )
      ),

      "MySQL", List.of(
        new QuestionSeedData(
          "Which SQL clause is used to filter query results based on a specified condition?",
          Difficulty.EASY, BigDecimal.valueOf(1),
          "The WHERE clause filters rows returned by a query prior to any grouping or sorting.",
          List.of(
            new OptionData("ORDER BY", false),
            new OptionData("GROUP BY", false),
            new OptionData("WHERE", true),
            new OptionData("HAVING", false)
          )
        ),
        new QuestionSeedData(
          "What database constraint ensures that all values in a column are unique and non-null?",
          Difficulty.EASY, BigDecimal.valueOf(1),
          "A PRIMARY KEY constraint uniquely identifies each record in a database table and cannot contain NULL values.",
          List.of(
            new OptionData("FOREIGN KEY", false),
            new OptionData("PRIMARY KEY", true),
            new OptionData("DEFAULT", false),
            new OptionData("CHECK", false)
          )
        ),
        new QuestionSeedData(
          "Which SQL statement is used to insert new rows into a MySQL database table?",
          Difficulty.MEDIUM, BigDecimal.valueOf(2),
          "INSERT INTO table_name (columns...) VALUES (values...) inserts new rows into a table.",
          List.of(
            new OptionData("UPDATE", false),
            new OptionData("ADD ROW", false),
            new OptionData("INSERT INTO", true),
            new OptionData("ALTER TABLE", false)
          )
        ),
        new QuestionSeedData(
          "What is the primary performance benefit of creating an Index on a database column?",
          Difficulty.MEDIUM, BigDecimal.valueOf(2),
          "Indexes speed up data retrieval (SELECT queries) by allowing MySQL to locate records without full table scans.",
          List.of(
            new OptionData("Reduces disk storage space", false),
            new OptionData("Speeds up data retrieval queries (SELECT) on the indexed column", true),
            new OptionData("Prevents duplicate rows across all columns", false),
            new OptionData("Automatically encrypts table data", false)
          )
        ),
        new QuestionSeedData(
          "Which JOIN type returns all records when there is a match in either left or right table?",
          Difficulty.HARD, BigDecimal.valueOf(3),
          "FULL OUTER JOIN combines records from both tables, filling NULLs where matching rows are absent.",
          List.of(
            new OptionData("INNER JOIN", false),
            new OptionData("LEFT JOIN", false),
            new OptionData("RIGHT JOIN", false),
            new OptionData("FULL OUTER JOIN", true)
          )
        )
      ),

      "General Knowledge", List.of(
        new QuestionSeedData(
          "Which chemical element has the symbol 'O' and atomic number 8?",
          Difficulty.EASY, BigDecimal.valueOf(1),
          "Oxygen is a chemical element represented by the symbol O and atomic number 8.",
          List.of(
            new OptionData("Nitrogen", false),
            new OptionData("Oxygen", true),
            new OptionData("Hydrogen", false),
            new OptionData("Carbon", false)
          )
        ),
        new QuestionSeedData(
          "Which ocean is the largest and deepest on Earth?",
          Difficulty.EASY, BigDecimal.valueOf(1),
          "The Pacific Ocean covers over 30% of Earth's surface area, making it the largest ocean.",
          List.of(
            new OptionData("Atlantic Ocean", false),
            new OptionData("Indian Ocean", false),
            new OptionData("Pacific Ocean", true),
            new OptionData("Arctic Ocean", false)
          )
        ),
        new QuestionSeedData(
          "Who is widely credited with inventing the World Wide Web in 1989?",
          Difficulty.MEDIUM, BigDecimal.valueOf(2),
          "Tim Berners-Lee invented the World Wide Web while working at CERN in 1989.",
          List.of(
            new OptionData("Alan Turing", false),
            new OptionData("Steve Jobs", false),
            new OptionData("Tim Berners-Lee", true),
            new OptionData("Bill Gates", false)
          )
        ),
        new QuestionSeedData(
          "What is the official capital city of Australia?",
          Difficulty.MEDIUM, BigDecimal.valueOf(2),
          "Canberra is the federal capital city of Australia.",
          List.of(
            new OptionData("Sydney", false),
            new OptionData("Melbourne", false),
            new OptionData("Canberra", true),
            new OptionData("Brisbane", false)
          )
        ),
        new QuestionSeedData(
          "Which planet in our solar system is known as the 'Red Planet'?",
          Difficulty.HARD, BigDecimal.valueOf(3),
          "Mars is called the Red Planet because iron oxide (rust) on its surface gives it a reddish appearance.",
          List.of(
            new OptionData("Venus", false),
            new OptionData("Mars", true),
            new OptionData("Jupiter", false),
            new OptionData("Saturn", false)
          )
        )
      )
    );

    List<Quiz> createdQuizzes = new ArrayList<>();
    List<String> categoryNames = List.of("Java", "React", "Spring Boot", "MySQL", "General Knowledge");

    for (int c = 0; c < categoryNames.size(); c++) {
      String name = categoryNames.get(c);
      Category category = categories.save(Category.builder()
        .name(name)
        .description("Practice essential " + name + " concepts with realistic questions.")
        .status(CategoryStatus.ACTIVE)
        .build());

      List<QuestionSeedData> seedQuestions = quizData.get(name);
      List<Question> savedQuestions = new ArrayList<>();

      for (QuestionSeedData qsd : seedQuestions) {
        Question question = Question.builder()
          .questionText(qsd.questionText())
          .category(category)
          .difficulty(qsd.difficulty())
          .marks(qsd.marks())
          .explanation(qsd.explanation())
          .createdBy(admin)
          .build();

        List<AnswerOption> options = new ArrayList<>();
        for (int j = 0; j < qsd.options().size(); j++) {
          OptionData od = qsd.options().get(j);
          options.add(AnswerOption.builder()
            .optionText(od.text())
            .correct(od.correct())
            .displayOrder(j + 1)
            .build());
        }

        question.replaceOptions(options);
        savedQuestions.add(questions.save(question));
      }

      Quiz quiz = quizzes.save(Quiz.builder()
        .title(name + " Foundations")
        .description("A timed assessment covering essential real-world " + name + " questions.")
        .category(category)
        .difficulty(Difficulty.values()[c % 3])
        .durationMinutes(10 + c * 2)
        .passingPercentage(BigDecimal.valueOf(60))
        .status(QuizStatus.PUBLISHED)
        .createdBy(admin)
        .build());
      createdQuizzes.add(quiz);

      for (int i = 0; i < savedQuestions.size(); i++) {
        quizQuestions.save(QuizQuestion.builder()
          .quiz(quiz)
          .question(savedQuestions.get(i))
          .questionOrder(i + 1)
          .build());
      }
    }

    seedAttempt(alice, createdQuizzes.get(0), 4, 1, 80, ResultStatus.PASS, 310, 5);
    seedAttempt(alice, createdQuizzes.get(1), 3, 2, 60, ResultStatus.PASS, 420, 4);
    seedAttempt(bob, createdQuizzes.get(2), 2, 3, 40, ResultStatus.FAIL, 515, 3);
  }

  private void seedAttempt(User user, Quiz quiz, int correct, int incorrect, int percentage,
                           ResultStatus result, long seconds, int daysAgo) {
    Instant submitted = Instant.now().minusSeconds(daysAgo * 86_400L);
    attempts.save(QuizAttempt.builder()
      .user(user).quiz(quiz)
      .startedAt(submitted.minusSeconds(seconds)).submittedAt(submitted)
      .status(AttemptStatus.SUBMITTED)
      .totalQuestions(correct + incorrect)
      .correctAnswers(correct).incorrectAnswers(incorrect).unansweredQuestions(0)
      .score(BigDecimal.valueOf(correct))
      .maximumScore(BigDecimal.valueOf(correct + incorrect))
      .percentage(BigDecimal.valueOf(percentage))
      .resultStatus(result).timeTakenSeconds(seconds)
      .build());
  }

  private User user(String username, String email, String fullName,
                    String password, Set<Role> roleSet) {
    return users.findByUsernameIgnoreCase(username).orElseGet(() ->
      users.save(User.builder()
        .username(username).email(email).fullName(fullName)
        .passwordHash(encoder.encode(password))
        .accountStatus(AccountStatus.ACTIVE)
        .roles(roleSet)
        .build()));
  }
}
