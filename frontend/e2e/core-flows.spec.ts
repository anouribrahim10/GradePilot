import { test, expect, type Page } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'e2e@gradepilot.test';
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2epassword123';

async function signIn(page: Page) {
  await page.goto('/auth');
  await page.getByRole('button', { name: 'Sign in' }).first().click();
  await page.getByPlaceholder(/email/i).fill(E2E_EMAIL);
  await page.getByPlaceholder(/password/i).fill(E2E_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).last().click();
  await page.waitForURL('**/chat');
}

test('1 — sign in', async ({ page }) => {
  await signIn(page);
  await expect(page).toHaveURL(/\/chat/);
});

test('2 — create a class via onboarding chat', async ({ page }) => {
  await signIn(page);
  await page.goto('/chat');
  const input = page.getByRole('textbox');
  await input.fill('Add a class called E2E Test Class');
  await input.press('Enter');
  await page.goto('/classes');
  await expect(page.getByText('E2E Test Class')).toBeVisible({ timeout: 10_000 });
});

test('3 — upload notes to a class', async ({ page }) => {
  await signIn(page);
  await page.goto('/classes');
  await page.getByText('E2E Test Class').click();
  await page.getByRole('tab', { name: /notes/i }).click();

  const textarea = page.getByPlaceholder(/paste notes here/i);
  await textarea.fill('These are e2e test notes for the class.');
  await page.getByRole('button', { name: /save notes/i }).click();
  await expect(page.getByText('1 note')).toBeVisible({ timeout: 10_000 });
});

test('4 — generate a study plan', async ({ page }) => {
  await signIn(page);
  await page.goto('/classes');
  await page.getByText('E2E Test Class').click();
  await page.getByRole('tab', { name: /study plan/i }).click();
  await page.getByRole('button', { name: /generate plan/i }).click();
  await expect(page.locator('text=/day|week|schedule/i').first()).toBeVisible({ timeout: 20_000 });
});

test('5 — generate a practice set', async ({ page }) => {
  await signIn(page);
  await page.goto('/classes');
  await page.getByText('E2E Test Class').click();
  await page.getByRole('tab', { name: /practice/i }).click();
  await page.getByPlaceholder(/topic/i).fill('e2e topic');
  await page.getByRole('button', { name: /generate/i }).click();
  await expect(page.locator('[class*="rounded-xl"]').nth(1)).toBeVisible({ timeout: 20_000 });
});
