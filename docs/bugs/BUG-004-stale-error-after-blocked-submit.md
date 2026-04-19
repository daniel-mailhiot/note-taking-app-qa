# BUG-004: Stale server error message persists when browser validation blocks a later form submission

| Field | Value |
|---|---|
| Bug ID | BUG-004 |
| Summary | After a failed registration renders a server-side error, if the user's next submission is blocked by the browser's built-in validation the form never re-posts, so the stale error remains visible even though it no longer applies. |
| Environment | Windows 11, Chrome 146.0.7680.165, Node 24.13.1, MongoDB 8.2.5 (mongosh 2.7.0) |
| Build/Commit | note-taking-app @ 7835fe78d15db06049db58964f5ee29f51859e12 |
| Severity | Minor |
| Priority | P4 |
| Status | Open |

## Preconditions
- App running locally at http://localhost:3000
- User 'testuser1' already exists (to trigger the duplicate-username error)
- User is on the registration page at /auth/register

## Steps to Reproduce
1. Navigate to /auth/register.
2. Enter 'testuser1' in the username field.
3. Enter 'password123' in the password field.
4. Click the Register button.
5. See 'Username already taken' error on the page.
6. Without navigating away, change the password field to '12345' (5 characters, below the minimum of 6).
7. Change username field to a unique username such as 'testuser101'
8. Click the Register button.
9. Observe the password length error appear while the 'Username already taken' error remains visible.

## Expected Result
The 'Username already taken' error should no longer be visible since the username has been changed to a unique username and the original error no longer applies.

## Actual Result
The browser's minlength tooltip appears under the password field as expected, but the 'Username already taken' error from step 5 remains rendered above the form even though the username has since been changed to a unique value. The displayed error is stale and no longer reflects the submitted form state.

## Observed Root Cause
Password length is caught by browser validation (`minlength="6"` in `app-under-test/views/auth/register.ejs` at line 51) before the form submits, so the request never reaches the server-side password length check in `app-under-test/controllers/authController.js`. The browser displays its own tooltip instead of the server's 'Password must be at least 6 characters' message at `authController.js` line 39.

## Scope
The same pattern exists on the login page. `app-under-test/views/auth/login.ejs` renders server errors in the same `<% if (error) %>` block at lines 14-18. The password field has no `minlength`, but both username at line 35 and password at line 49 use the `required` attribute, so an 'Invalid username or password' error will persist if the user submits with an empty required field after the initial server error.

## Evidence
- Failing test case: none (discovered during transition between TC-002 and TC-003)
- Related test cases: TC-002, TC-003 (docs/test-cases.csv)
- Test run: TR-001 (docs/test-run-01.md)
- Screenshot: evidence/TR-001/manual/BUG-004-stale-error.png

## Suggested Fix
Clear the alert as soon as the user starts editing, since the displayed error no longer matches what's in the form. A single `input` listener added to the shared `app-under-test/views/partials/scripts.ejs` at [scripts.ejs line 6](app-under-test/views/partials/scripts.ejs#L6) can remove any `.alert-danger` the moment the user types, which covers both `register.ejs` and `login.ejs` without per-page changes. The server-side validation is unchanged. This only hides a stale message that no longer applies.