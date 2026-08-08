CREATE DATABASE IF NOT EXISTS quiz_application CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quiz_application;

CREATE TABLE IF NOT EXISTS roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  username VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  account_status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX idx_users_status (account_status)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500),
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

CREATE TABLE IF NOT EXISTS quizzes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  category_id BIGINT NOT NULL,
  difficulty ENUM('EASY','MEDIUM','HARD') NOT NULL,
  duration_minutes INT NOT NULL,
  passing_percentage DECIMAL(5,2) NOT NULL,
  status ENUM('DRAFT','PUBLISHED','INACTIVE') NOT NULL DEFAULT 'DRAFT',
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX idx_quizzes_catalogue (status, category_id, difficulty),
  INDEX idx_quizzes_title (title),
  CONSTRAINT fk_quiz_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_quiz_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_text TEXT NOT NULL,
  category_id BIGINT NOT NULL,
  difficulty ENUM('EASY','MEDIUM','HARD') NOT NULL,
  marks DECIMAL(8,2) NOT NULL,
  explanation TEXT,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX idx_questions_category_difficulty (category_id, difficulty),
  CONSTRAINT fk_question_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_question_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS answer_options (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  option_text VARCHAR(600) NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL,
  CONSTRAINT uq_question_option_order UNIQUE (question_id, display_order),
  CONSTRAINT fk_option_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  quiz_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  question_order INT NOT NULL,
  CONSTRAINT uq_quiz_question UNIQUE (quiz_id, question_id),
  CONSTRAINT uq_quiz_question_order UNIQUE (quiz_id, question_order),
  CONSTRAINT fk_qq_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
  CONSTRAINT fk_qq_question FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  quiz_id BIGINT NOT NULL,
  started_at TIMESTAMP(6) NOT NULL,
  submitted_at TIMESTAMP(6),
  status ENUM('IN_PROGRESS','SUBMITTED','EXPIRED') NOT NULL,
  total_questions INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  incorrect_answers INT NOT NULL DEFAULT 0,
  unanswered_questions INT NOT NULL DEFAULT 0,
  score DECIMAL(10,2) NOT NULL DEFAULT 0,
  maximum_score DECIMAL(10,2) NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  result_status ENUM('PASS','FAIL'),
  time_taken_seconds BIGINT NOT NULL DEFAULT 0,
  INDEX idx_attempt_user_started (user_id, started_at),
  INDEX idx_attempt_quiz_status (quiz_id, status),
  CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_attempt_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

CREATE TABLE IF NOT EXISTS user_answers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  attempt_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  selected_option_id BIGINT,
  is_correct BOOLEAN,
  marks_awarded DECIMAL(8,2) NOT NULL DEFAULT 0,
  answered_at TIMESTAMP(6),
  CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id),
  CONSTRAINT fk_answer_attempt FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES questions(id),
  CONSTRAINT fk_answer_option FOREIGN KEY (selected_option_id) REFERENCES answer_options(id)
);
