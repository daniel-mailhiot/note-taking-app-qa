import { test, Page, expect } from '@playwright/test';

// Registers a new user through the UI and leaves the browser context logged in
// Username = timestamp + worker index, safe under parallel runs and across reruns
export async function registerFreshUser(page: Page): Promise<{ username: string; password: string }> {
  const username = `qa_pw_user_${Date.now()}_w${test.info().workerIndex}`;
  const password = 'pwtest123';

  await page.goto('/auth/register');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL('/notes');
  await expect(page.getByText(username)).toBeVisible();

  return { username, password };
}
