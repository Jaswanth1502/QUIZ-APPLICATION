# Security design

## Authentication

Passwords are encoded using BCrypt. Successful login and registration return a short-lived JWT access token. The refresh token is sent as an HttpOnly, SameSite cookie. Secrets and expirations are configured through environment variables.

## Authorization

- Public endpoints expose active categories and published quiz metadata.
- Authenticated routes require an active account.
- Administrator endpoints require `ROLE_ADMIN`.
- Method and request authorization are applied in Spring Security.
- Attempt lookup is scoped to the current user's identifier.

## Quiz integrity

- The server records the official start time.
- Only published quizzes containing questions can be started.
- Options are returned without `isCorrect`.
- Saved questions must belong to the quiz.
- Saved options must belong to their question.
- Expiry is derived from the official start time and quiz duration.
- Submission is transactional and duplicate submissions are rejected.
- Correct options, explanations, and awarded marks are released only after submission.
- The frontend does not submit scores or correctness values.

## Deployment checklist

Replace all development passwords and `JWT_SECRET`, use TLS, restrict `FRONTEND_URL`, disable development seed data, use managed secret storage, set secure cookie attributes for the deployment domain, rotate credentials, and enable database backup/monitoring.
