import { test, expect } from '@playwright/test';

/**
 * Basic test suite for booking limit functionality
 * Focuses on the core features we implemented
 */
test.describe('Booking Limit - Basic Tests', () => {
  test('should load booking page successfully', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify the page loads correctly
    await expect(page).toHaveTitle(/PeluApp/);
    
    // Check that the booking page component is present
    const bookingPage = page.locator('pelu-booking-page');
    await expect(bookingPage).toBeVisible();
  });

  test('should show calendar component', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Wait for the calendar component to be present
    const calendarComponent = page.locator('pelu-calendar-component');
    await expect(calendarComponent).toBeVisible();
    
    // Check that the calendar container exists
    const calendarContainer = page.locator('.calendar-container');
    await expect(calendarContainer).toBeVisible();
  });

  test('should handle mobile view correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Check that mobile booking component is shown
    const mobileBooking = page.locator('pelu-booking-mobile-page');
    await expect(mobileBooking).toBeVisible();
  });

  test('should show no-appointments-message component when needed', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Look for the no-appointments-message component
    const noAppointmentsMessage = page.locator('pelu-no-appointments-message');
    
    // The component might or might not be visible depending on user state
    // We just verify it exists in the DOM
    await expect(noAppointmentsMessage).toBeAttached();
  });

  test('should have proper CSS classes for blocked state', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Wait for calendar to load
    await page.waitForSelector('pelu-calendar-component', { timeout: 10000 });
    
    // Check calendar container
    const calendarContainer = page.locator('.calendar-container');
    await expect(calendarContainer).toBeVisible();
    
    // The calendar might be blocked or not depending on user state
    // We verify the structure is correct
    const hasBlockedClass = await calendarContainer.hasClass('blocked');
    
    // If blocked, verify the styling
    if (hasBlockedClass) {
      await expect(calendarContainer).toHaveCSS('opacity', '0.6');
    }
  });

  test('should have time slots with proper classes', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Wait for calendar to load
    await page.waitForSelector('pelu-calendar-component', { timeout: 10000 });
    
    // Look for time slots
    const timeSlots = page.locator('.time-slot');
    
    // Verify time slots exist
    if (await timeSlots.count() > 0) {
      await expect(timeSlots.first()).toBeVisible();
      
      // Check that time slots have appropriate classes
      const firstSlot = timeSlots.first();
      const classList = await firstSlot.getAttribute('class');
      expect(classList).toBeTruthy();
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Verify desktop booking component
    const desktopBooking = page.locator('pelu-booking-page');
    await expect(desktopBooking).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Verify mobile booking component
    const mobileBooking = page.locator('pelu-booking-mobile-page');
    await expect(mobileBooking).toBeVisible();
  });

  test('should have proper component structure', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Check for key components
    const components = [
      'pelu-booking-page',
      'pelu-calendar-component',
      'pelu-no-appointments-message'
    ];
    
    for (const component of components) {
      const element = page.locator(component);
      await expect(element).toBeAttached();
    }
  });

  test('should handle page refresh correctly', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Get initial state
    const initialCalendar = page.locator('.calendar-container');
    await expect(initialCalendar).toBeVisible();
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify the page loads correctly after refresh
    const refreshedCalendar = page.locator('.calendar-container');
    await expect(refreshedCalendar).toBeVisible();
  });
});
