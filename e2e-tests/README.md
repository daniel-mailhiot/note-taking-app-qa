# Notes App UI Smoke

Playwright UI smoke suite for the note-taking-app. Verifies in a browser that a user can register, log in, create a note, and log out. Each test ties back to a manual test case ID in `docs/test-cases.csv` for traceability.

## Contents
- `playwright.config.ts` - test runner config (baseURL, chromium-only project, list and html reporters, screenshot and trace on failure)
- `tests/smoke.spec.ts` - the smoke suite (3 tests under one `@smoke` describe block)
- `tests/helpers/auth.ts` - shared helper that registers a fresh user via the UI and returns the credentials

## Coverage

### Smoke flows
- `TC-004 login reaches notes page` - registers a fresh user to get usable credentials, logs out, then logs back in through the login form. Asserts the redirect to `/notes` and that the navbar shows the logged-in username.
- `TC-008 create note appears in list` - creates a note via the new-note form and asserts it appears exactly once in the list. The `toHaveCount(1)` check guards against any regression similar to BUG-001 (duplicate-on-refresh).
- `TC-006 + TC-007 logout invalidates session` - clicks Logout and asserts the redirect to `/auth/login`, then attempts direct navigation to `/notes` and asserts the protected-route redirect back to login.

### Why these three
Together these flows cover the minimum end-to-end path through the app. A failure in any one would prevent normal use. Wider coverage (edit, delete, input validation, ownership, boundary lengths) is handled by the manual suite in `docs/test-cases.csv` and the Newman API suite in `api-tests/`.

## Design Choices

### Fresh user per test
Each test calls `registerFreshUser(page)` which generates `qa_pw_user_<timestamp>_w<workerIndex>` and submits the register form. The timestamp keeps reruns separated and the worker index keeps parallel tests separated.

### Accessible selectors
Locators prefer `getByLabel`, `getByRole`, and `getByText` over CSS classes. The app's forms have proper `<label>` and `<button type="submit">` markup, so these selectors map directly to user intent and survive CSS refactors.

### Auto-waiting assertions, no fixed sleeps
All waits are state-based (`toHaveURL`, `toBeVisible`, `toHaveCount`) and retry until the condition is true or the timeout expires. There are no `waitForTimeout` calls since fixed sleeps tend to be a common source of flake in UI suites.

### Chromium only
The QA Strategy scopes UI smoke to a single browser, so the config's `projects` array contains only chromium. Cross-browser testing is intentionally out of scope.

### Manual app startup
The config has no `webServer` block, so MongoDB and the app must be started manually before running the suite. This was to keep the local workflow the same as the Newman suite in `api-tests/` rather than automating in this step. GitHub Actions CI/CD setup will be done separately.

## Running with Playwright (CLI)

### Prerequisites
- App under test running at `http://localhost:3000` (see main [README](../README.md))
- Node.js installed

### 1) Install
From the QA repo root:

```bash
cd e2e-tests
```
```bash
npm install
```
```bash
npx playwright install chromium
```

### 2) Run
From `e2e-tests/`:

```bash
npm run smoke
```

A passing run prints a list reporter summary like:

```text
Running 3 tests using 3 workers
  ✓  1 [chromium] › smoke.spec.ts:9:7 › @smoke › TC-004 login reaches notes page
  ✓  2 [chromium] › smoke.spec.ts:25:7 › @smoke › TC-008 create note appears in list
  ✓  3 [chromium] › smoke.spec.ts:49:7 › @smoke › TC-006 + TC-007 logout invalidates session

  3 passed (Xs)
```

After the run, open the HTML report with:

```bash
npx playwright show-report
```

On failure, screenshots and traces appear under `test-results/<test-name>/`.

## Traceability
Each test name includes the manual test case ID it maps to. Matching IDs live in `docs/test-cases.csv`, and linked defects live in `docs/bugs/`.
