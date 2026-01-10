import { test, expect } from '@playwright/test';

test('test chat functionality', async ({ page }) => {
    // Go to the live URL (or localhost if testing locally, but user asked for live debugging)
    // We'll test the most recent deployment URL provided by the agent in context, or the main one.
    const liveUrl = 'https://unspoken-gpl2cxyi7-whytesteven74-1176s-projects.vercel.app';

    await page.goto(liveUrl);

    // Check for the initial "I'm listening" text
    await expect(page.getByText("I'm listening")).toBeVisible();

    // Type a message
    const input = page.locator('input[placeholder="Type how you feel..."]');
    await input.fill('I am feeling anxious about this test');
    await input.press('Enter');

    // Verify the user message appears
    await expect(page.getByText('I am feeling anxious about this test')).toBeVisible();

    // Wait for AI response (allow some time for cold boot/streaming)
    // We look for any message that is NOT the user's message and is visible.
    // The user messages have "bg-slate-800" (or similar dark bg), AI messages are white/light.
    // Or we just wait for text that isn't the user's input.

    // Wait for at least one message that contains "Unspoken" or "AI" or just ANY text in the assistant bubble.
    // Assistant bubbles are: .bg-white.text-slate-700

    // Let's wait for a specific element selector
    const assistantMessage = page.locator('.items-start .bg-white');
    await expect(assistantMessage).toBeVisible({ timeout: 20000 });

    // Log the content
    const text = await assistantMessage.textContent();
    console.log('AI Response:', text);

    expect(text?.length).toBeGreaterThan(0);
});
