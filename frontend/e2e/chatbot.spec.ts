import { test, expect } from '@playwright/test';

test('Chatbot user flow: submit message and see mock response', async ({ page }) => {
    await page.goto('/');

    // Find the input and send button
    const input = page.getByPlaceholder('Type a message');
    const sendButton = page.getByTestId('send-button');

    // Verify input and button are visible
    await expect(input).toBeVisible();
    await expect(sendButton).toBeVisible();

    // Type a message
    const userMessage = 'Hello, AI!';
    await input.fill(userMessage);

    // Click send
    await sendButton.click();

    // Check that the user message appears
    await expect(page.locator(`text=${userMessage}`)).toBeVisible();

    // Wait for the mock response to appear
    const mockResponse = 'This is a mocked AI response.';
    await expect(page.locator(`text=${mockResponse}`)).toBeVisible();
});

test('Chatbot empty input flow', async ({ page }) => {
    await page.goto('/');

    const sendButton = page.getByTestId('send-button');
    await sendButton.click();

    // Error message should appear
    await expect(page.getByTestId('error-message')).toHaveText('Message cannot be empty.');
});
