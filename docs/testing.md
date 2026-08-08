# Testing

## Backend

Run:

```bash
cd backend
mvn test
```

The project includes Spring context coverage, authentication validation coverage, and score formula coverage. The service boundaries are structured for additional Mockito and integration tests for ownership, expiry, CRUD, correct-answer privacy, and duplicate submission.

## Frontend

Run:

```bash
cd frontend
npm install
npm test -- --run
```

Vitest uses jsdom and React Testing Library. Included tests cover reusable quiz presentation and route/status behavior. Add API mocks for broader end-to-end component coverage.

## Manual workflow checklist

### User

Register, authenticate, filter catalogue, open instructions, start a timed attempt, answer and navigate, submit, review the result, inspect answer explanations, open history, update profile, and log out.

### Administrator

Authenticate as `admin`, open statistics, manage a category, create a four-option question, create a quiz, attach a question, publish it, confirm catalogue visibility, inspect attempts, update status, and log out.

### Responsive/accessibility

Check keyboard navigation, visible focus, labels, validation errors, tables at narrow widths, mobile navigation, and quiz controls at mobile/tablet/desktop breakpoints.
