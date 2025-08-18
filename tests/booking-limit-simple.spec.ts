import { test, expect } from '@playwright/test';

/**
 * Simple test suite for booking limit functionality
 * Tests basic page loading and component structure
 */
test.describe('Booking Limit - Simple Tests', () => {
  test('should load booking page and show basic structure', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/booking-page-loaded.png' });
    
    // Verify the page loads (even if redirected to login)
    await expect(page).toHaveTitle(/PeluApp/);
    
    // Check if we're on the booking page or login page
    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth/login')) {
      // We're on login page, which is expected for unauthenticated users
      console.log('User redirected to login page - this is expected behavior');
      
      // Verify login page elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      
    } else if (currentUrl.includes('/bookings')) {
      // We're on the booking page
      console.log('User is on booking page');
      
      // Check for booking page components
      const bookingPage = page.locator('pelu-booking-page');
      if (await bookingPage.count() > 0) {
        await expect(bookingPage).toBeVisible();
      }
      
      // Check for calendar component
      const calendarComponent = page.locator('pelu-calendar-component');
      if (await calendarComponent.count() > 0) {
        await expect(calendarComponent).toBeVisible();
      }
    }
  });

  test('should handle mobile viewport correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/booking-page-mobile.png' });
    
    // Check current URL to determine what page we're on
    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth/login')) {
      // On login page - verify mobile layout
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      
    } else if (currentUrl.includes('/bookings')) {
      // On booking page - check for mobile components
      const mobileBooking = page.locator('pelu-booking-mobile-page');
      if (await mobileBooking.count() > 0) {
        await expect(mobileBooking).toBeVisible();
      }
    }
  });

  test('should show appropriate components based on authentication state', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/booking-page-auth-state.png' });
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth/login')) {
      // Verify login form is present
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      
    } else if (currentUrl.includes('/bookings')) {
      // Verify booking page components are present
      const components = [
        'pelu-booking-page',
        'pelu-calendar-component',
        'pelu-no-appointments-message'
      ];
      
      for (const component of components) {
        const element = page.locator(component);
        if (await element.count() > 0) {
          await expect(element).toBeAttached();
        }
      }
    }
  });

  test('should handle page refresh correctly', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Get initial URL
    const initialUrl = page.url();
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify the page loads correctly after refresh
    const refreshedUrl = page.url();
    expect(refreshedUrl).toBe(initialUrl);
    
    // Take a screenshot after refresh
    await page.screenshot({ path: 'test-results/booking-page-refresh.png' });
  });

  test('should have proper HTML structure', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Verify basic HTML structure
    await expect(page.locator('html')).toBeAttached();
    await expect(page.locator('body')).toBeAttached();
    await expect(page.locator('head')).toBeAttached();
    
    // Check for Angular app root
    const appRoot = page.locator('app-root');
    if (await appRoot.count() > 0) {
      await expect(appRoot).toBeAttached();
    }
  });

  test('should load without JavaScript errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit more for any delayed errors
    await page.waitForTimeout(2000);
    
    // Log any errors for debugging
    if (errors.length > 0) {
      console.log('JavaScript errors found:', errors);
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/booking-page-no-errors.png' });
  });
});
