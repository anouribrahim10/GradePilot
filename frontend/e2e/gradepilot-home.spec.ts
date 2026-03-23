import { test, expect } from '@playwright/test';

test('home page renders GradePilot dashboard', async ({ page }) => {
  await page.goto('/');

  // Main brand heading
  await expect(page.getByRole('heading', { name: /GradePilot/i })).toBeVisible();

  // Key section present on the dashboard
  await expect(page.getByText(/Your Active Plan/i)).toBeVisible();
});

