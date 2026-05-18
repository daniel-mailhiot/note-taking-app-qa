# note-taking-app-qa

This repository is the QA workspace for the `note-taking-app` project. It is currently a work in progress and will be expanded as QA artifacts are completed.

The purpose of this project is to build familiarity with common QA tools and documentation practices, while strengthening my problem-solving and investigative skills in identifying issues, narrowing them down to likely causes, and documenting the results.

## Tools
The toolset for this QA project includes Postman and Newman for API testing, Playwright for end-to-end UI smoke testing, and GitHub Actions for running smoke checks automatically in CI.

## Completed
- QA strategy document
- Manual test cases with a recorded execution run and evidence
- Defect reports with reproduction steps and linked evidence
- Postman API smoke collection
- Newman command line runner for the API smoke
- Playwright UI smoke suite

## Remaining
- GitHub Actions workflow that runs the Newman smoke first, then the Playwright smoke

## App Under Test
- Repository: https://github.com/daniel-mailhiot/note-taking-app
- Submodule path: `app-under-test`
- Pinned commit: `7835fe78d15db06049db58964f5ee29f51859e12`

## Getting Started

### 1) Prerequisites
- Git
- Node.js
- MongoDB

### 2) Clone the QA Repo with Submodules
Use `--recurse-submodules` so Git clones both this QA repo and the `app-under-test` submodule in one step.

```bash
git clone --recurse-submodules https://github.com/daniel-mailhiot/note-taking-app-qa
```
```bash
cd note-taking-app-qa
```

> **Already cloned without submodules?** If the `app-under-test` folder is empty or missing files, run `git submodule update --init --recursive` from the QA repo root to fetch the app at its pinned commit.

### 3) Verify the Pinned App Version
```bash
cd app-under-test
```
```bash
git rev-parse HEAD
```

Expected output:

```text
7835fe78d15db06049db58964f5ee29f51859e12
```

### 4) Run the App Under Test
Stay in `app-under-test` and install dependencies:

```bash
npm install
```

Create a `.env` file in `app-under-test` with:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/noteAppDB
SESSION_SECRET=enter_a_random_session_secret_here
BCRYPT_SALT_ROUNDS=10
```

Make sure MongoDB is running, then start the app:

```bash
npm run dev
```

Open the app in your browser at:

```text
http://localhost:3000
```

## Newman API Smoke

With the app under test running, open a new terminal for the following steps.

From the QA repo root:

```bash
cd api-tests
```
```bash
npm install
```
```bash
npm run smoke
```

A passing run should end with a Newman table like this:

|  | Executed | Failed |
|---|---:|---:|
| Iterations | 1 | 0 |
| Requests | 9 | 0 |
| Test scripts | 9 | 0 |
| Prerequest scripts | 5 | 0 |
| Assertions | 23 | 0 |

**See [api-tests/README.md](api-tests/README.md) for details on the API smoke and Postman UI workflow.**

## Playwright UI Smoke

With the app under test running, open a new terminal for the following steps.

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

**See [e2e-tests/README.md](e2e-tests/README.md) for more details on the Playwright UI smoke.**

## Setup Note
To avoid duplicate setup steps, use this README as the primary setup guide. Refer to setup instructions in app-under-test's README only for additional setup information if needed.