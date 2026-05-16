import { test, expect } from '@playwright/test';

test('landing page renders brand and primary nav', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'GradePilot' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Features' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'How it Works' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pricing' })).toBeVisible();
});
