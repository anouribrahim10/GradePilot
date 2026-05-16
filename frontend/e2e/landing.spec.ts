import { test, expect } from '@playwright/test';

test('landing page renders brand and primary nav', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/GradePilot/i);

  const nav = page.locator('nav').first();
  await expect(nav.getByRole('link', { name: 'GradePilot' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Features' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'How it Works' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Pricing' })).toBeVisible();
});
