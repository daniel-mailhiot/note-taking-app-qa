# BUG-003: Error responses in noteController render plain text without the app layout

| Field | Value |
|---|---|
| Bug ID | BUG-003 |
| Summary | All error responses in `noteController.js` use `res.status().send()` plain text, so 400, 404, and 500 pages lose the app header, navigation, logout button, and styling. Users have no way to return to the app except the browser back button. |
| Environment | Windows 11, Chrome 146.0.7680.165, Node 24.13.1, MongoDB 8.2.5 (mongosh 2.7.0) |
| Build/Commit | note-taking-app @ 7835fe78d15db06049db58964f5ee29f51859e12 |
| Severity | Minor |
| Priority | P4 |
| Status | Open |

## Preconditions
- App running locally at http://localhost:3000
- Two users exist: 'testuser1' and 'testuser2'. 'testuser1' has a note whose ID you can copy.

## Steps to Reproduce
One representative path (ownership 404):
1. Log in as 'testuser1' and create a note.
2. Open the Edit page for that note and copy the note ID from the URL.
3. Click the Logout button.
4. Log in as 'testuser2'.
5. Navigate directly to `/notes/<note-id>/edit` by typing the URL.

## Expected Result
The error page renders inside the app layout (header, navigation, logout) and shows a clear error message, giving the user a way to return to `/notes`.

## Actual Result
The page shows a plain text 'Note not found' with no layout, no navigation, and no link or button. The only way back is the browser back button.

## Observed Root Cause
In `app-under-test/controllers/noteController.js` at lines 111 and 132, the 'Note not found' response is rendered as unstyled plain text via `res.send()` rather than an EJS template.

## Scope
All error responses in `noteController.js` use `res.status().send()` (plain text) instead of rendering an EJS template with the app layout. This means any error page (400, 404, 500) loses the header, navigation, styling, and logout button. The user has no way to return to the app except using the browser back button. Observed in TC-011 (ownership 404) and TC-012 (validation 500). This affects all 12 error responses in `noteController.js` (lines 15, 27, 41, 52, 62, 69, 85, 91, 111, 117, 132, 141).

## Evidence
- Failing test case: none (discovered during TC-011 and TC-012)
- Related test cases: TC-011, TC-012 (docs/test-cases.csv)
- Test run: TR-001 (docs/test-run-01.md)
- Screenshots:
  - evidence/TR-001/manual/TC-011a-ownership-edit-PASS.png
  - evidence/TR-001/manual/TC-011b-ownership-delete-PASS.png
  - evidence/TR-001/manual/TC-012-whitespace-only-fields-FAIL.png

## Suggested Fix
Create `views/errors/error.ejs` that includes partials and displays the `message` passed to it. Then replace each of the 12 `res.status(code).send(...)` calls in `noteController.js` (listed in Scope above) with `res.status(code).render('errors/error', { title: 'Error', message: '...' })`. Middleware at [app.js line 35](app-under-test/app.js#L35) already sets `currentUsername` for every page, so the render calls only need to pass `title` and `message`.