import { test, expect } from '@playwright/test';
import { registerFreshUser } from './helpers/auth';

// UI smoke suite for the Notes App. Each test registers a fresh user, exercises
// one user flow end to end, and asserts both the visible state and the
// underlying session behavior. Filter with --grep @smoke
test.describe('@smoke', () => {

  test('TC-004 login reaches notes page', async ({ page }) => {
    // Register first to create valid credentials, then log out to reach the login form
    const { username, password } = await registerFreshUser(page);
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL('/auth/login');

    // Fill in the login form with the credentials returned from the helper
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    // A successful login redirects to /notes and the navbar shows the username
    await expect(page).toHaveURL('/notes');
    await expect(page.getByText(username)).toBeVisible();
  });

  test('TC-008 create note appears in list', async ({ page }) => {
    // Helper leaves the session logged in on /notes
    await registerFreshUser(page);

    // Unique title per run so the assertion can locate it and count occurrences
    const noteTitle = `Smoke note ${Date.now()}`;
    const noteContent = 'Created by Playwright UI smoke';

    await page.getByRole('link', { name: 'New Note' }).click();
    await expect(page).toHaveURL('/notes/new');

    await page.getByLabel('Title').fill(noteTitle);
    await page.getByLabel('Content').fill(noteContent);
    await page.getByRole('button', { name: 'Save Note' }).click();

    // The app re-renders the notes list after save, URL stays at /notes
    await expect(page).toHaveURL('/notes');

    // Assert the note appears exactly once, forward-looking guard against
    // BUG-001 (duplicate-on-refresh) ever leaking into the initial save
    const noteHeading = page.getByRole('heading', { level: 2, name: noteTitle });
    await expect(noteHeading).toHaveCount(1);
  });

  test('TC-006 + TC-007 logout invalidates session', async ({ page }) => {
    // Helper leaves the session logged in on /notes
    await registerFreshUser(page);

    // Logout clears the session cookie and redirects to the login page
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL('/auth/login');

    // Direct navigation to a protected route should redirect back to login,
    // proving the session was actually invalidated and not just visually hidden
    await page.goto('/notes');
    await expect(page).toHaveURL('/auth/login');
  });

});
