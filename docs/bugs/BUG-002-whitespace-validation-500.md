# BUG-002: Whitespace-only note fields return a generic 500 instead of a validation message

| Field | Value |
|---|---|
| Bug ID | BUG-002 |
| Summary | Submitting a new note with only whitespace in title and content is rejected by the database, but the user sees a generic 'Failed to create note' 500 page instead of a clear validation error. |
| Environment | Windows 11, Chrome 146.0.7680.165, Node 24.13.1, MongoDB 8.2.5 (mongosh 2.7.0) |
| Build/Commit | note-taking-app @ 7835fe78d15db06049db58964f5ee29f51859e12 |
| Severity | Minor |
| Priority | P3 |
| Status | Open |

## Preconditions
- App running locally at http://localhost:3000
- User 'testuser1' is logged in

## Steps to Reproduce
1. Click the New Note button.
2. Enter only spaces in the title field.
3. Enter only spaces in the content field.
4. Click the Save Note button.

## Expected Result
The note is not created and the app displays a clear validation message such as 'Title and content are required', so the user understands what to fix.

## Actual Result
The note is not created, but the response is a plain text 'Failed to create note' message rendered from the generic catch-block 500 handler. The user cannot tell whether this was a validation issue or a real server error.

## Observed Root Cause
In `app-under-test/controllers/noteController.js` at line 26, the guard `if (!title || !content)` does not trim input first, so `'   '` passes as truthy. The request reaches `Note.create()` at line 31. Mongoose's schema (`models/Note.js` lines 7 and 13 `trim: true`, lines 8 and 14 `required: true`) strips the input to an empty string and throws a `ValidationError`. The catch block at line 41 handles this generically instead of returning the controller's own 'Title and content are required' message at line 27.

## Evidence
- Failing test case: TC-012 (docs/test-cases.csv)
- Test run: TR-001 (docs/test-run-01.md)
- Screenshot: evidence/TR-001/manual/TC-012-whitespace-only-fields-FAIL.png

## Suggested Fix
Trim before the truthy check at [noteController.js line 26](app-under-test/controllers/noteController.js#L26): `if (!title?.trim() || !content?.trim())`. That branch already returns the correct message at [line 27](app-under-test/controllers/noteController.js#L27). As a follow-up, the catch block at [line 41](app-under-test/controllers/noteController.js#L41) could distinguish Mongoose `ValidationError` from other errors so future validation rules surface useful messages automatically.