# QA Strategy - note-taking-app

## Overview
This document defines the QA strategy for the `note-taking-app`, a server-rendered application built with Node.js, Express, MongoDB, and EJS templates. Testing is scoped to the pinned baseline commit `7835fe78d15db06049db58964f5ee29f51859e12`.

The goal is to validate core functionality (authentication, note CRUD, session management, and ownership enforcement) through a combination of manual testing, API smoke checks (Postman/Newman), and UI smoke tests (Playwright).


## In-Scope
The following areas are in scope:

### Authentication
- User registration (success and failure paths)
- User login (success and failure paths)
- Logout and session invalidation
- Protected route enforcement (unauthenticated users redirected to login)

### Note CRUD Operations
- Create, read, update, and delete notes for authenticated users
- Input validation (missing/blank fields, boundary lengths)

### Ownership Enforcement
- Users can only view, edit, and delete their own notes
- Cross-user access attempts are blocked

### Session Management
- Session persistence across requests
- Session destruction on logout
- Cookie cleanup on logout

### Known Defects
- Duplicate note creation on browser refresh after creating a note


## Out-of-Scope
The following areas are intentionally excluded:

- **Performance and load testing:** The app is small and there are no requirements for how many users it needs to support at the same time.
- **Security penetration testing**: Beyond the scope of this QA effort (eg, vulnerabilities like NoSQL injection, XSS, CSRF).
- **Cross-browser compatibility**: Testing will use a single browser (Chromium via Playwright).
- **Mobile responsiveness**: No mobile layout requirements are defined.
- **Database administration**: MongoDB internals, indexing, and backup are not tested.
- **Deployment and infrastructure**: Server provisioning, hosting, and scaling are not in scope.
- **Accessibility (a11y)**: No accessibility requirements are defined for the current baseline.


## Risk Matrix

| ID | Risk Area | Likelihood | Impact | Priority | Mitigation |
|----|-----------|-----------|--------|----------|------------|
| R1 | Authentication bypass - unauthenticated user accesses protected routes | Low | Critical | High | Test `requireAuth` middleware and verify redirect for all `/notes` routes |
| R2 | Ownership violation - user modifies or deletes another user's notes | Low | Critical | High | Test cross-user edit/delete with two separate accounts |
| R3 | Duplicate note on refresh - POST-then-render pattern causes re-submission | High | Medium | High | Reproduce and document, then verify with manual and automated tests |
| R4 | Session persistence failure - user logged out unexpectedly | Low | High | Medium | Verify session survives across multiple requests |
| R5 | Input validation bypass - missing, blank, whitespace-only, or oversized fields accepted | Medium | Medium | Medium | Test empty fields, whitespace-only input, and boundary lengths (title 40 chars, content 2000 chars) on both create and update endpoints |
| R6 | Registration with duplicate username - not properly rejected | Low | Medium | Medium | Attempt duplicate registration and verify 409 response |
| R7 | Logout does not fully invalidate session - stale session allows access | Low | High | Medium | After logout, attempt direct navigation to `/notes` |
| R8 | Invalid note ID causes unhandled server error | Medium | Low | Low | Submit malformed IDs to edit/delete endpoints and document behavior |


## Test Approach

### Manual Testing
- Design 12-15 test cases covering all in-scope areas (documented in `docs/test-cases.csv`).
- Execute at least one full manual smoke run against the local app.
- Record results with pass/fail status, screenshots for failures, and linked bug IDs.

### API Smoke Testing (Postman/Newman)
- Build a Postman collection with 6-8 API checks covering auth and note CRUD.
- Use Newman to run the collection from the command line.
- Cover both positive (happy path) and negative (invalid input, unauthorized access) scenarios.
- Note: the app returns HTML pages and redirects rather than JSON responses, so checks will focus on status codes, redirect locations, and response content rather than JSON schema validation.

### UI Smoke Testing (Playwright)
- Write 2-3 lightweight end-to-end tests targeting critical user flows.
- Include login, note creation, and logout/redirect verification.
- Use screenshot-on-failure for evidence capture.

### CI Integration (GitHub Actions)
- One workflow that runs Newman API smoke checks first, then Playwright UI smoke checks.
- Triggered on push and manual dispatch.


## Entry Criteria
Testing can begin when:
- The app-under-test submodule is pinned to the baseline commit and the app runs locally.
- MongoDB is running and accessible.
- The QA strategy and test cases are documented.

## Exit Criteria
Testing is considered complete when:
- All 12-15 manual test cases have been executed at least once.
- All discovered defects are logged with complete reproduction steps and evidence.
- The Newman API smoke suite passes with 6-8 checks.
- The Playwright UI smoke suite passes with 2-3 tests.
- The GitHub Actions workflow runs successfully.
- A final QA report summarizes results, open defects, and a release recommendation.


## Test Environment
- **Application**: note-taking-app @ commit `7835fe78d15db06049db58964f5ee29f51859e12`
- **Runtime**: Node.js (local)
- **Database**: MongoDB (local, `mongodb://127.0.0.1:27017/noteAppDB`)
- **Browser**: Chromium (via Playwright)
- **OS**: Windows 11
- **API Testing**: Postman (GUI) + Newman (CLI)
- **UI Testing**: Playwright
- **CI**: GitHub Actions
