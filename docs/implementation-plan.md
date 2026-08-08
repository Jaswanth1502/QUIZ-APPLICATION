# Implementation plan

1. Model the normalized MySQL schema and JPA entities.
2. Implement Spring Security, JWT access tokens, HttpOnly refresh cookies, role authorization, validation, and error handling.
3. Add public catalogue, user profile, timed-attempt, scoring, review, history, and administrator APIs.
4. Seed development roles, accounts, categories, quizzes, questions, options, and representative attempts.
5. Build the React/Vite/TypeScript interface with guarded routes, forms, responsive components, timed quiz state, dashboards, and CRUD screens.
6. Add Docker Compose, environment templates, SQL scripts, tests, OpenAPI, and project documentation.
7. Validate file structure, configuration formats, source syntax indicators, secret hygiene, and create the delivery archive.

The backend is the authority for time, ownership, answer membership, correctness, scoring, and pass/fail status. The browser never receives correct-answer flags before submission.
