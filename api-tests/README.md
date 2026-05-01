# Notes App API Smoke

Postman collection and environment for API smoke testing the note-taking-app. Covers authentication, notes CRUD, and negative cases. Each request ties back to a manual test case ID in `docs/test-cases.csv` for traceability.

## Contents
- `notes-app-smoke.postman_collection.json` - the smoke collection (Auth, Notes, Negative folders), Postman Collection Format v2.1.0
- `notes-app-smoke.postman_environment.json` - the local environment (baseURL, test credentials, shared variables)

## Coverage

### Auth
- `POST /auth/register` (TC-001) - creates a fresh user, username is timestamped per run so the suite is rerunnable
- `POST /auth/logout` (TC-006) - register auto-creates a session, so logout runs before login to verify the session cookie clears
- `POST /auth/login` (TC-004) - re-authenticates so the Notes folder requests run with a valid session

### Notes
- `POST /notes` (TC-008) - creates a note and captures the new note's ID into `{{noteId}}`
- `PUT /notes/:id` (TC-009) - updates the note captured above
- `DELETE /notes/:id` (TC-010) - deletes the same note

### Negative
- `POST /auth/login` with wrong password (TC-005) - expects 401 and no session cookie
- `POST /notes` with whitespace-only fields (TC-012, BUG-002) - pinned to current buggy 500 behavior, see Design Choices
- `GET /notes` without a session (TC-007) - expects 302 redirect to `/auth/login`

## Design Choices

### Pinning the known-bug assertion (TC-012, BUG-002)
The whitespace-only-fields test asserts the current buggy behavior (`500` with a generic `Failed to create note` page) on purpose. I chose to assert the current buggy behavior rather than assert the expected fixed behavior so Newman stays green, and when BUG-002 is fixed this test will intentionally go red which is the signal to flip the assertions to the expected 400.

### Form-encoded request bodies, not JSON
The app uses `express.urlencoded({ extended: true })` and server-rendered EJS pages, so bodies are sent as `x-www-form-urlencoded`. Successful responses are redirects or HTML pages rather than JSON. Assertions check status codes, `Location` headers, `Set-Cookie` presence, and key HTML fragments rather than JSON fields.

### Auto-follow-redirects disabled where the app redirects
A successful login is actually a `302 Found` with `Location: /notes` and a `Set-Cookie: connect.sid=...` header. The `200 OK` page render comes from a follow-up request the client makes after the redirect. With auto-follow on, one test silently covers two things at once and a broken login can hide behind a successful notes render. Disabling it on register, login, logout, delete, and the unauthenticated `/notes` check pins each test to the server's actual contract (status, redirect target, cookie).

### Cookie-based sessions
Auth uses `express-session` with a `connect.sid` cookie. The collection relies on the runner's cookie jar to pick up the `Set-Cookie` from login automatically and send it with subsequent requests, so no manual header wiring is needed. The two self-contained negative tests (TC-005 invalid login and TC-007 unauthenticated /notes) clear the jar in a pre-request script so each request hits the app as a logged-out user regardless of prior state.

### Request chaining via environment variables
The Create note test script parses the first `/notes/<id>/edit` link out of the returned HTML (the list is sorted newest-first) and stores the ID in `{{noteId}}`. Update and Delete reference that variable, which keeps the trio runnable back to back without hardcoding anything.

## Running with Newman (CLI)

### Prerequisites
- App under test running at `http://localhost:3000` (see main [README](../README.md))
- Node.js installed

### 1) Install
From the QA repo root:

```bash
cd api-tests
```
```bash
npm install
```

### 2) Run
From `api-tests/`:

```bash
npm run smoke
```

All 9 requests should pass.

## Running with the Postman UI

### 1) Start the app-under-test
Follow the main [README](../README.md) to start the app at `http://localhost:3000` and make sure MongoDB is running.

### 2) Import the collection and environment into Postman
In Postman, click Import and drop in both files from this folder. Select the `Local - note-taking-app` environment in the top-right dropdown.

### 3) Allow cookies for localhost (first time only)
Two negative tests (TC-005 invalid login and TC-007 unauthenticated /notes) use `pm.cookies.jar().clear()` to wipe the session cookie before sending, so you might see a warning with something like `programmatic cookies are disabled for this domain` that blocks the clear.

To fix:
1. Open any request and click Cookies (below the Send button).
2. Click Domains Allowlist.
3. Add `localhost`.

### 4) Run the collection
Open Collection Runner, select `Notes App API Smoke`, confirm the `Local - note-taking-app` environment is selected, and click Run. All requests should pass in order.

## Traceability
Every request references its manual test case ID in the name and description. Matching IDs live in `docs/test-cases.csv`, and linked defects live in `docs/bugs/`.