# note-taking-app-qa

This repository is the QA workspace for the `note-taking-app` project. It is currently a work in progress and will be expanded as QA artifacts are completed.

The purpose of this project is to build familiarity with common QA tools and documentation practices, while strengthening my problem-solving and investigative skills in identifying issues, narrowing them down to likely causes, and documenting the results.

## Planned Tools
The planned toolset for this QA project includes Postman and Newman for API testing, Playwright for end-to-end UI smoke testing, and GitHub Actions for running smoke checks automatically in CI.

## Planned QA Work
- Manual test case design and execution
- Clear and reproducible defect reporting
- API smoke testing with Postman and Newman
- Lightweight UI smoke testing with Playwright
- A GitHub Actions smoke workflow

## App Under Test
- Repository: https://github.com/daniel-mailhiot/note-taking-app
- Submodule path: `app-under-test`
- Pinned commit: `7835fe78d15db06049db58964f5ee29f51859e12`

## Getting Started (Local Setup)
### 1) Prerequisites
- Git
- Node.js
- MongoDB

### 2) Clone the QA Repo with submodules
Use `--recurse-submodules` so Git clones both this QA repo and the `app-under-test` submodule in one step.

```bash
git clone --recurse-submodules https://github.com/daniel-mailhiot/note-taking-app-qa
```
Then:

```bash
cd note-taking-app-qa
```

### If You Already Cloned Without Submodules
If the `app-under-test` folder is empty or missing files, run this from the QA repo root:

```bash
git submodule update --init --recursive
```

This downloads and initializes the app submodule at the exact pinned commit.

### 3) Verify the Pinned App Version
Run the following commands inside `app-under-test`:

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
From the QA repo root:

```bash
cd app-under-test
```
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

## Notes
To avoid duplicate setup steps, use this README as the primary setup guide. Refer to setup instructions in app-under-test's README only for additional setup information if needed.