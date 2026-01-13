import { test, expect } from '@playwright/test';

test('chat interface functionality', async ({ page }) => {
    // Navigate to the chat page
    await page.goto('/');

    // Verify initial state
    await expect(page.getByText("I'm listening")).toBeVisible();

    // Type and send a message
    const input = page.locator('input[placeholder="Type how you feel..."]');
    await input.fill('Is the system working?');
    await input.press('Enter');

    // Verify user message appears immediately
    await expect(page.getByText('Is the system working?')).toBeVisible();

    // Check for loading state (dots)
    // Note: It might be too fast to catch, so we don't strictly assert existence if it's already done.

    // Wait for response bubble
    // The assistant bubble has a white background
    const assistantBubble = page.locator('.items-start .bg-white').first();

    // Wait for it to contain text
    await expect(assistantBubble).toBeVisible({ timeout: 60000 });
    await expect(assistantBubble).not.toBeEmpty();

    // Wait for meaningful content (more than just a few chars)
    // This confirms streaming is accumulating text
    await expect(async () => {
        const text = await assistantBubble.textContent();
        expect(text?.length).toBeGreaterThan(10);
    }).toPass({ timeout: 15000 });

    const finalText = await assistantBubble.textContent();
    console.log('Verified AI Response:', finalText);
});
