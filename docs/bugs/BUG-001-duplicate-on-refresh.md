# BUG-001: Duplicate note created when user refreshes after save

| Field | Value |
|---|---|
| Bug ID | BUG-001 |
| Summary | Refreshing the notes list after creating a note duplicates the note, because the create handler re-renders the list instead of redirecting. |
| Environment | Windows 11, Chrome 146.0.7680.165, Node 24.13.1, MongoDB 8.2.5 (mongosh 2.7.0) |
| Build/Commit | note-taking-app @ 7835fe78d15db06049db58964f5ee29f51859e12 |
| Severity | Major |
| Priority | P2 |
| Status | Open |

## Preconditions
- App running locally at http://localhost:3000
- User 'testuser1' exists and is logged in
- The notes list may be empty or populated

## Steps to Reproduce
1. Log in as 'testuser1'.
2. Click the New Note button.
3. Enter 'Refresh Test Note' in the title field.
4. Enter 'Testing duplicate on refresh' in the content field.
5. Click the Save Note button.
6. After the notes list appears and shows the new note, press F5 or click the browser refresh button.
7. If the browser shows a 'Confirm Form Resubmission' dialog, click to confirm.
8. See two copies of 'Refresh Test Note' in the list.

## Expected Result
Only one copy of 'Refresh Test Note' should appear in the list.

## Actual Result
Two copies of 'Refresh Test Note' appear in the list. Each subsequent refresh creates another duplicate.

## Observed Root Cause
In `app-under-test/controllers/noteController.js` at line 38, `createNewNote` calls `listNotes(req, res)` instead of `res.redirect('/notes')`, so the browser's last request remains the POST and refreshing resubmits it. This is the same issue as `updateNote` (see TC-009). `deleteNote` at line 88 does not have this problem because it uses `res.redirect('/notes')`.

## Scope and Related Observations
- Same root cause affects edit submissions (see TC-009 notes in docs/test-run-01.md).
- No data loss, but the notes list can accumulate duplicates if the user refreshes habitually.

## Evidence
- Failing test case: TC-014 (docs/test-cases.csv)
- Related test case: TC-009 (shares root cause)
- Test run: TR-001 (docs/test-run-01.md)
- Screenshot: evidence/TR-001/manual/TC-014-duplicate-on-refresh-FAIL.png

## Suggested Fix
Replace `return listNotes(req, res)` with `return res.redirect('/notes')` at [noteController.js line 38](app-under-test/controllers/noteController.js#L38) (`createNewNote`) and [line 66](app-under-test/controllers/noteController.js#L66) (`updateNote`), matching `deleteNote` [line 88](app-under-test/controllers/noteController.js#L88). The redirect triggers a fresh `GET /notes` that re-runs `listNotes`, so the user still lands on the updated list.