# Test Run 01 - Manual Smoke

## Run Info
| Field | Value |
|---|---|
| Run ID | TR-001 |
| Date | 2026-03-27 to [update when done] |
| Tester | Daniel |
| App Commit | 7835fe78d15db06049db58964f5ee29f51859e12 |
| Environment | Windows 11, Chrome 146.0.7680.165, Node 24.13.1, MongoDB 8.2.5 (mongosh 2.7.0) |
| Type | Manual Smoke |

## Summary
| Metric | Count |
|---|---|
| Total Executed | 10 |
| Passed | 10 |
| Failed | 0 |
| Not Run | 5 |

## Results by Test Case
| ID | Title | Result | Notes |
|---|---|---|---|
| TC-001 | Registration success with unique username | PASS | |
| TC-002 | Registration failure for duplicate username | PASS | |
| TC-003 | Registration failure for short password | PASS | Password length is caught by browser validation (register.ejs line 51) before the form submits, so the request never reaches server-side controller validation (authController.js) or database schema validation (User.js). The browser displays its own tooltip instead of the server's 'Password must be at least 6 characters' message (authController.js line 39). Original expected result assumed a server-side message. |
| TC-004 | Login success with valid credentials | PASS | |
| TC-005 | Login failure with invalid credentials | PASS | |
| TC-006 | Logout invalidates session and blocks protected pages | PASS | |
| TC-007 | Unauthenticated access to /notes redirects to login | PASS | |
| TC-008 | Create note succeeds for authenticated user | PASS | |
| TC-009 | Edit note succeeds for owner | PASS | After updating, the URL bar shows /notes/<id>?_method=PUT instead of /notes. The edit form (edit.ejs line 19) submits a POST to /notes/<id>?_method=PUT. The method-override middleware (app.js line 21) converts this to a PUT request. After a successful update, the updateNote controller (noteController.js line 66) calls listNotes(req, res) which re-renders the notes list instead of redirecting. Because no redirect occurs, the browser still displays the original form submission URL. |
| TC-010 | Delete note succeeds for owner | PASS | After deleting, the URL bar correctly shows /notes because deleteNote (noteController.js line 88) uses res.redirect('/notes'). This is inconsistent with updateNote (noteController.js line 66) which calls listNotes() instead of redirecting (see TC-009 note). |
| TC-011 | Ownership enforcement blocks cross-user edit and delete | NOT RUN | |
| TC-012 | Validation rejects whitespace-only note fields | NOT RUN | |
| TC-013 | Boundary length accepted for note title and content | NOT RUN | |
| TC-014 | Duplicate note on browser refresh after create | NOT RUN | |
| TC-015 | Invalid note ID behavior for malformed and nonexistent IDs | NOT RUN | |

## Defects Found
| Bug ID | Summary | Severity | Linked Test Cases |
|---|---|---|---|
| (none yet) | | | |

## Evidence
Screenshots are stored in `evidence/TR-001/manual/`.

## Notes and Observations
- Error messages from previous failed actions persist on the page if a subsequent form submission is blocked by browser validation before reaching the server. 
Discovered during transition between TC-002 and TC-003, the browser's built-in validation caught the short password and blocked the form from submitting (the tooltip under password bar is from the browser, not from the app).
But because the form never submitted, the app never had a chance to clear or replace the old error message, so the "Username already taken" message stayed on screen even though it no longer applied.
