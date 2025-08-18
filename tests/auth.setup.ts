import { test as setup, expect } from '@playwright/test';

/**
 * Authentication setup for Playwright tests
 * This file handles login before running the main tests
 */
setup('authenticate', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/auth/login');
  
  // Wait for the login page to load
  await page.waitForLoadState('networkidle');
  
  // Fill in login credentials
  // Note: You'll need to replace these with actual test credentials
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'testpassword123');
  
  // Click the login button
  await page.click('button[type="submit"]');
  
  // Wait for successful login (redirect to home or dashboard)
  await page.waitForURL('**/bookings**', { timeout: 10000 });
  
  // Verify we're logged in by checking for authenticated user elements
  await expect(page.locator('body')).not.toContainText('Login');
  
  // Store authentication state
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});

/**
 * Setup for unauthenticated tests
 */
setup('unauthenticated', async ({ page }) => {
  // Navigate to the booking page without authentication
  await page.goto('/bookings');
  await page.waitForLoadState('networkidle');
  
  // Store unauthenticated state
  await page.context().storageState({ path: 'playwright/.auth/guest.json' });
});
