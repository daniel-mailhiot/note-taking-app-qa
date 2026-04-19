# Test Run 01 - Manual Smoke

## Run Info
| Field | Value |
|---|---|
| Run ID | TR-001 |
| Date | 2026-03-27 to 2026-03-30 |
| Tester | Daniel |
| App Commit | 7835fe78d15db06049db58964f5ee29f51859e12 |
| Environment | Windows 11, Chrome 146.0.7680.165, Node 24.13.1, MongoDB 8.2.5 (mongosh 2.7.0) |
| Type | Manual Smoke |

## Summary
| Metric | Count |
|---|---|
| Total Executed | 15 |
| Passed | 13 |
| Failed | 2 |
| Not Run | 0 |

## Results by Test Case
| ID | Title | Result | Notes |
|---|---|---|---|
| TC-001 | Registration success with unique username | PASS | |
| TC-002 | Registration failure for duplicate username | PASS | |
| TC-003 | Registration failure for short password | PASS | Password length is caught by browser validation (register.ejs line 51) before the form submits, so the request never reaches server-side controller validation (authController.js) or database schema validation (User.js). The browser displays its own tooltip instead of the server's 'Password must be at least 6 characters' message (authController.js line 39). Original expected result assumed a server-side message. Marked PASS because the intent of the test (confirm short passwords cannot register and the user sees why) is satisfied, and the only difference from the expected_result is which part of the app shows the message, not how the app behaves. |
| TC-004 | Login success with valid credentials | PASS | |
| TC-005 | Login failure with invalid credentials | PASS | |
| TC-006 | Logout invalidates session and blocks protected pages | PASS | |
| TC-007 | Unauthenticated access to /notes redirects to login | PASS | |
| TC-008 | Create note succeeds for authenticated user | PASS | |
| TC-009 | Edit note succeeds for owner | PASS | After updating, the URL bar shows /notes/<id>?_method=PUT instead of /notes. The edit form (edit.ejs line 19) submits a POST to /notes/<id>?_method=PUT. The method-override middleware (app.js line 21) converts this to a PUT request. After a successful update, the updateNote controller (noteController.js line 66) calls listNotes(req, res) which re-renders the notes list instead of redirecting. Because no redirect occurs, the browser still displays the original form submission URL. |
| TC-010 | Delete note succeeds for owner | PASS | After deleting, the URL bar correctly shows /notes because deleteNote (noteController.js line 88) uses res.redirect('/notes'). This is inconsistent with updateNote (noteController.js line 66) which calls listNotes() instead of redirecting (see TC-009 note). |
| TC-011 | Ownership enforcement blocks cross-user edit and delete | PASS | Ownership enforcement works as expected. The "Note not found" message (noteController.js lines 111 and 132) is rendered as unstyled plain text via res.send() rather than an EJS template, so the page has no app layout, navigation, or styling. User has no way to navigate back except using the browser back button. |
| TC-012 | Validation rejects whitespace-only note fields | FAIL | FAIL: Whitespace-only input was rejected, but the error message is "Failed to create note" (generic 500 from catch block, noteController.js line 41) instead of a clear validation message. The controller check if (!title \|\| !content) (noteController.js line 26) does not trim input first, so "   " passes as truthy in JavaScript. The input reaches Note.create() (noteController.js line 31) where Mongoose applies trim: true (Note.js lines 7, 13) stripping it to "", then required: true (Note.js lines 8, 14) rejects the empty string and throws a ValidationError. The catch block handles this generically instead of returning the controller's own "Title and content are required" message (noteController.js line 27). |
| TC-013 | Boundary length accepted for note title and content | PASS | |
| TC-014 | Duplicate note on browser refresh after create | FAIL | FAIL: Refreshing after note creation causes the note to duplicate. createNewNote (noteController.js line 38) calls listNotes(req, res) instead of res.redirect('/notes'), so the browser's last request remains the POST and refreshing resubmits it. This is the same issue as updateNote (see TC-009). deleteNote (noteController.js line 88) does not have this problem because it uses res.redirect('/notes'). |
| TC-015 | Invalid note ID behavior for malformed and nonexistent IDs | PASS | |

## Defects Found
| Bug ID | Summary | Severity | Failed in | Also observed in |
|---|---|---|---|---|
| [BUG-001](bugs/BUG-001-duplicate-on-refresh.md) | Refreshing after note creation duplicates the note because `createNewNote` re-renders the list instead of redirecting (Post/Redirect/Get not followed). Same missing-redirect pattern in `updateNote` produces the TC-009 URL-persistence symptom. | Major | TC-014 | TC-009 |
| [BUG-002](bugs/BUG-002-whitespace-validation-500.md) | Whitespace-only title and content fall through the controller's truthy check and are rejected later by Mongoose, surfacing as a generic "Failed to create note" 500 instead of a clear validation message. | Minor | TC-012 | (none) |
| [BUG-003](bugs/BUG-003-error-responses-plain-text.md) | All 12 error responses in `noteController.js` use `res.send()` plain text, so error pages drop the app layout, header, navigation, and logout button. Users can only return via the browser back button. | Minor | (none) | TC-011, TC-012 |
| [BUG-004](bugs/BUG-004-stale-error-after-blocked-submit.md) | Server-rendered error messages on /auth/register remain visible when the next submission is blocked by HTML5 validation before reaching the server, so a stale "Username already taken" can persist against a now-unique username. Same pattern exists on /auth/login. | Minor | (none) | TC-002, TC-003 |

## Evidence
Screenshots are stored in `evidence/TR-001/manual/`.

## Notes and Observations
- Error messages from previous failed actions persist on the page if a subsequent form submission is blocked by browser validation before reaching the server. 
Discovered during transition between TC-002 and TC-003, the browser's built-in validation caught the short password and blocked the form from submitting (the tooltip under password bar is from the browser, not from the app).
But because the form never submitted, the app never had a chance to clear or replace the old error message, so the "Username already taken" message stayed on screen even though it no longer applied.

- All error responses in noteController.js use res.status().send() (plain text) instead of rendering an EJS template with the app layout. This means any error page (400, 404, 500) loses the header, navigation, styling, and logout button. The user has no way to return to the app except using the browser back button. Observed in TC-011 (ownership 404) and TC-012 (validation 500). This affects all 12 error responses in noteController.js (lines 15, 27, 41, 52, 62, 69, 85, 91, 111, 117, 132, 141).