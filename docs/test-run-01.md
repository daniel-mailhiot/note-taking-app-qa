# Test Run 01 - Manual Smoke

## Run Info
| Field | Value |
|---|---|
| Run ID | TR-001 |
| Date | 2026-03-25 to [update when done] |
| Tester | Daniel (Me) |
| App Commit | 7835fe78d15db06049db58964f5ee29f51859e12 |
| Environment | Windows 11, Chrome 146.0.7680.165, Node 24.13.1, MongoDB 8.2.5 (mongosh 2.7.0) |
| Type | Manual Smoke |

## Summary
| Metric | Count |
|---|---|
| Total Executed | 0 |
| Passed | 0 |
| Failed | 0 |
| Not Run | 15 |

## Results by Test Case
| ID | Title | Result | Notes |
|---|---|---|---|
| TC-001 | Registration success with unique username | NOT RUN | |
| TC-002 | Registration failure for duplicate username | NOT RUN | |
| TC-003 | Registration failure for short password | NOT RUN | |
| TC-004 | Login success with valid credentials | NOT RUN | |
| TC-005 | Login failure with invalid credentials | NOT RUN | |
| TC-006 | Logout invalidates session and blocks protected pages | NOT RUN | |
| TC-007 | Unauthenticated access to /notes redirects to login | NOT RUN | |
| TC-008 | Create note succeeds for authenticated user | NOT RUN | |
| TC-009 | Edit note succeeds for owner | NOT RUN | |
| TC-010 | Delete note succeeds for owner | NOT RUN | |
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
[Will be filled in as testing progresses]
