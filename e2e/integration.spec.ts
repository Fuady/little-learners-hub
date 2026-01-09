import { test, expect } from '@playwright/test';

test('homepage loads and displays materials from backend', async ({ page }) => {
    // Add console logging
    page.on('console', msg => console.log(`Browser console: ${msg.text()}`));
    page.on('pageerror', err => console.log(`Browser error: ${err.message}`));

    // 1. Go to homepage
    await page.goto('/');

    // 2. Check for the main welcome message
    await expect(page.getByText('Welcome to KidLearn!')).toBeVisible();

    // 3. Check for specific data that comes from the backend (via Index page "Popular This Week")
    // The 'ABC Tracing Fun' is a material hardcoded in the backend mock DB
    await expect(page.getByText('ABC Tracing Fun')).toBeVisible({ timeout: 10000 });

    // 4. Navigate to Materials page
    await page.getByRole('link', { name: 'Explore Materials' }).click();
    await expect(page).toHaveURL(/\/materials/);

    // 5. Verify materials are loaded on the materials page
    await expect(page.getByText('Learning Materials 📚')).toBeVisible();
    await expect(page.getByText('ABC Tracing Fun')).toBeVisible();
});

test('authentication flow', async ({ page }) => {
    page.on('console', msg => console.log(`Browser console: ${msg.text()}`));
    page.on('pageerror', err => console.log(`Browser error: ${err.message}`));

    await page.goto('/');

    // Open login modal
    await page.getByRole('button', { name: 'Join as Parent or Educator' }).click();

    // Fill login form (using one of the mock users)
    await page.fill('input[type="email"]', 'parent@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify login success (Login button should be gone)
    await expect(page.getByRole('button', { name: 'Join as Parent or Educator' })).not.toBeVisible();
});
