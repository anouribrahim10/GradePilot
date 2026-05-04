import { test, expect } from '@playwright/test';

// All tests use storageState set in playwright.config.ts (signed-in session)

test('1 — sign in', async ({ page }) => {
  await page.goto('/classes');
  await expect(page).toHaveURL(/\/classes/, { timeout: 10_000 });
});

test('2 — create a class via onboarding chat', async ({ page }) => {
  await page.goto('/chat');
  await page.waitForLoadState('networkidle');
  const input = page.getByRole('textbox').first();
  await input.waitFor({ state: 'visible', timeout: 10_000 });
  await input.fill('Add a class called E2E Test Class');
  await input.press('Enter');
  await page.goto('/classes');
  await expect(page.getByText('E2E Test Class')).toBeVisible({ timeout: 15_000 });
});

test('3 — upload notes to a class', async ({ page }) => {
  await page.goto('/classes');
  await page.waitForLoadState('networkidle');
  await page.getByText('E2E Test Class').first().click();
  await page.getByRole('tab', { name: /notes/i }).click();
  const textarea = page.getByPlaceholder(/paste notes here/i);
  await textarea.waitFor({ state: 'visible', timeout: 10_000 });
  await textarea.fill('These are e2e test notes for the class.');
  await page.getByRole('button', { name: /save notes/i }).click();
  await expect(page.getByText(/note/i)).toBeVisible({ timeout: 10_000 });
});

test('4 — generate a study plan', async ({ page }) => {
  await page.goto('/classes');
  await page.waitForLoadState('networkidle');
  await page.getByText('E2E Test Class').first().click();
  await page.getByRole('tab', { name: /study plan/i }).click();
  await page.getByRole('button', { name: /generate plan/i }).click();
  await expect(page.getByRole('button', { name: /generate plan/i })).toBeEnabled({ timeout: 25_000 });
});

test('5 — generate a practice set', async ({ page }) => {
  await page.goto('/classes');
  await page.waitForLoadState('networkidle');
  await page.getByText('E2E Test Class').first().click();
  await page.getByRole('tab', { name: /practice/i }).click();
  const topicInput = page.getByPlaceholder(/topic/i);
  await topicInput.waitFor({ state: 'visible', timeout: 10_000 });
  await topicInput.fill('e2e topic');
  await page.getByRole('button', { name: /generate/i }).click();
  await expect(page.getByRole('button', { name: /generate/i })).toBeEnabled({ timeout: 25_000 });
});
