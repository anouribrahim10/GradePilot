import { test, expect } from '@playwright/test';

test('home page renders GradePilot dashboard', async ({ page }) => {
  await page.goto('/');

  // Main brand name in navbar
  await expect(page.getByText('GradePilot').first()).toBeVisible();

  // Hero heading present on the landing page
  await expect(page.getByText(/autonomous/i)).toBeVisible();
});
