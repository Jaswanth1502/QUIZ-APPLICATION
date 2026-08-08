# API overview

Base path: `/api/v1`

Swagger UI is available at `/swagger-ui.html` while the backend is running. OpenAPI JSON is available at `/v3/api-docs`.

## Authentication

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | Create a user account |
| POST | `/auth/login` | Authenticate and issue tokens |
| POST | `/auth/refresh` | Rotate/refresh an access token using the cookie |
| POST | `/auth/logout` | Clear refresh authentication |
| GET | `/auth/me` | Return the authenticated principal |

## Public catalogue

`GET /categories`, `GET /quizzes`, and `GET /quizzes/{quizId}`. Quiz listing accepts `search`, `category`, `difficulty`, `page`, `size`, and Spring sort parameters.

## User endpoints

Profile and dashboard endpoints are under `/users/me`. Attempt lifecycle:

1. `POST /quizzes/{quizId}/attempts`
2. `GET /attempts/{attemptId}`
3. `PUT /attempts/{attemptId}/answers`
4. `POST /attempts/{attemptId}/submit`
5. `GET /attempts/{attemptId}/result`
6. `GET /attempts/{attemptId}/review`

The start/active response intentionally omits correctness. Review data is available only after submission.

## Administrator endpoints

Administrator routes under `/admin` cover users, categories, quizzes, quiz-question assignments, the question bank, attempts, dashboard statistics, and per-quiz statistics.

## Error envelope

Validation and domain errors use a stable JSON envelope containing UTC timestamp, HTTP status, error, message, request path, and optional field-level errors. Stack traces and database details are not returned.
