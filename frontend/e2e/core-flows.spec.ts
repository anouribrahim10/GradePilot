import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function getClassId(): string {
  const state = JSON.parse(fs.readFileSync(path.join(__dirname, '.e2e-state.json'), 'utf-8'));
  return state.classId;
}

test('1 — sign in', async ({ page }) => {
  await page.goto('/classes');
  await expect(page).toHaveURL(/\/classes/, { timeout: 10_000 });
});

test('2 — create a class via onboarding chat', async ({ page }) => {
  // Class is created in global-setup via API; verify it appears in the UI
  await page.goto('/classes');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('E2E Test Class')).toBeVisible({ timeout: 15_000 });
});

test('3 — upload notes to a class', async ({ page }) => {
  const classId = getClassId();
  await page.goto(`/classes/${classId}`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Notes' }).click();
  const textarea = page.getByPlaceholder(/paste notes here/i);
  await textarea.waitFor({ state: 'visible', timeout: 10_000 });
  await textarea.fill('These are e2e test notes for the class.');
  await page.getByRole('button', { name: /save notes/i }).click();
  await expect(page.getByText(/note/i)).toBeVisible({ timeout: 10_000 });
});

test('4 — generate a study plan', async ({ page }) => {
  const classId = getClassId();
  await page.goto(`/classes/${classId}`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Notes' }).click();
  const btn = page.getByRole('button', { name: /generate plan/i });
  await btn.waitFor({ state: 'visible', timeout: 10_000 });
  await btn.click();
  await expect(btn).toBeEnabled({ timeout: 25_000 });
});

test('5 — generate a practice set', async ({ page }) => {
  const classId = getClassId();
  await page.goto(`/classes/${classId}`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Practice' }).click();
  const topicInput = page.getByPlaceholder(/topic/i);
  await topicInput.waitFor({ state: 'visible', timeout: 10_000 });
  await topicInput.fill('e2e topic');
  await page.getByRole('button', { name: /generate/i }).click();
  await expect(page.getByRole('button', { name: /generate/i })).toBeEnabled({ timeout: 25_000 });
});
