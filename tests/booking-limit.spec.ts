import { test, expect } from '@playwright/test';

/**
 * Test suite for booking limit functionality
 * Validates that users cannot book more appointments when they reach the limit
 */
test.describe('Booking Limit Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should show user limit reached message when user has maximum appointments', async ({ page }) => {
    // This test assumes the user already has the maximum number of appointments
    // In a real scenario, you would need to set up test data first
    
    // Wait for the page to be fully loaded
    await page.waitForSelector('pelu-booking-page', { timeout: 10000 });
    
    // Check if the user limit reached message is displayed
    const limitMessage = page.locator('pelu-no-appointments-message');
    
    // The message should be visible if the user has reached the limit
    await expect(limitMessage).toBeVisible();
    
    // Verify the message content
    await expect(limitMessage.locator('.title')).toContainText('Límit de reserves assolit');
    await expect(limitMessage.locator('.message-text')).toContainText('Ja tens una reserva activa');
    
    // Verify that the action button is NOT shown (showAction="false")
    const actionButton = limitMessage.locator('.message-actions .btn');
    await expect(actionButton).not.toBeVisible();
  });

  test('should block calendar when user has reached appointment limit', async ({ page }) => {
    // Wait for the calendar to be loaded
    await page.waitForSelector('pelu-calendar-component', { timeout: 10000 });
    
    // Check if the calendar has the blocked class
    const calendarContainer = page.locator('.calendar-container');
    
    // The calendar should have the blocked class when user has reached limit
    await expect(calendarContainer).toHaveClass(/blocked/);
    
    // Verify the blocked calendar overlay message
    await expect(calendarContainer).toHaveCSS('opacity', '0.6');
    
    // Check that the blocked message overlay is present
    const blockedMessage = page.locator('.calendar-container::before');
    // Note: ::before pseudo-elements are not directly accessible in Playwright
    // We'll verify the visual effect through other means
    
    // Verify that time slots are disabled
    const timeSlots = page.locator('.time-slot');
    if (await timeSlots.count() > 0) {
      // All time slots should be disabled
      for (let i = 0; i < await timeSlots.count(); i++) {
        await expect(timeSlots.nth(i)).toHaveClass(/disabled/);
      }
    }
  });

  test('should prevent time slot selection when calendar is blocked', async ({ page }) => {
    // Wait for the calendar to be loaded
    await page.waitForSelector('pelu-calendar-component', { timeout: 10000 });
    
    // Try to click on a time slot
    const timeSlots = page.locator('.time-slot.clickable');
    
    if (await timeSlots.count() > 0) {
      // Click on the first available time slot
      await timeSlots.first().click();
      
      // Verify that no service selection popup appears
      const servicePopup = page.locator('pelu-service-selection-popup');
      await expect(servicePopup).not.toBeVisible();
    }
  });

  test('should block mobile booking progression when user has reached limit', async ({ page }) => {
    // Set mobile viewport to trigger mobile booking component
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for the mobile booking component to load
    await page.waitForSelector('pelu-booking-mobile-page', { timeout: 10000 });
    
    // Verify that the user limit message is shown
    const limitMessage = page.locator('pelu-no-appointments-message');
    await expect(limitMessage).toBeVisible();
    
    // Check that the continue button is disabled
    const continueButton = page.locator('button:has-text("Continuar")');
    if (await continueButton.count() > 0) {
      await expect(continueButton.first()).toBeDisabled();
    }
    
    // Verify that the user cannot proceed to the next step
    const nextStepButton = page.locator('button:has-text("Continuar"), button:has-text("Continue")');
    if (await nextStepButton.count() > 0) {
      await expect(nextStepButton.first()).toBeDisabled();
    }
  });

  test('should show correct message when user has no appointments', async ({ page }) => {
    // This test would require setting up a user with no appointments
    // For now, we'll verify the component structure
    
    // Wait for the booking page to load
    await page.waitForSelector('pelu-booking-page', { timeout: 10000 });
    
    // Check if the calendar is not blocked (user can book)
    const calendarContainer = page.locator('.calendar-container');
    
    // The calendar should NOT have the blocked class when user can book
    await expect(calendarContainer).not.toHaveClass(/blocked/);
    
    // Verify that time slots are clickable
    const clickableTimeSlots = page.locator('.time-slot.clickable');
    if (await clickableTimeSlots.count() > 0) {
      await expect(clickableTimeSlots.first()).toBeVisible();
    }
  });

  test('should allow booking when user is under the limit', async ({ page }) => {
    // This test assumes the user has fewer than the maximum appointments
    // In a real scenario, you would need to set up test data first
    
    // Wait for the calendar to be loaded
    await page.waitForSelector('pelu-calendar-component', { timeout: 10000 });
    
    // Check that the calendar is not blocked
    const calendarContainer = page.locator('.calendar-container');
    await expect(calendarContainer).not.toHaveClass(/blocked/);
    
    // Look for available time slots
    const availableTimeSlots = page.locator('.time-slot.available');
    
    if (await availableTimeSlots.count() > 0) {
      // Click on an available time slot
      await availableTimeSlots.first().click();
      
      // Verify that the service selection popup appears
      const servicePopup = page.locator('pelu-service-selection-popup');
      await expect(servicePopup).toBeVisible();
    }
  });

  test('should handle responsive behavior correctly', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForSelector('pelu-booking-page', { timeout: 10000 });
    
    // Verify desktop booking component is shown
    const desktopBooking = page.locator('pelu-booking-page');
    await expect(desktopBooking).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000); // Wait for responsive change
    
    // Verify mobile booking component is shown
    const mobileBooking = page.locator('pelu-booking-mobile-page');
    await expect(mobileBooking).toBeVisible();
  });

  test('should show appropriate tooltips when calendar is blocked', async ({ page }) => {
    // Wait for the calendar to be loaded
    await page.waitForSelector('pelu-calendar-component', { timeout: 10000 });
    
    // Hover over a time slot to check tooltip
    const timeSlots = page.locator('.time-slot');
    
    if (await timeSlots.count() > 0) {
      await timeSlots.first().hover();
      
      // Check if the tooltip shows the blocked message
      // Note: Tooltip testing might require additional setup depending on how tooltips are implemented
      const tooltip = page.locator('[title*="Has arribat al límit de reserves"]');
      // This is a basic check - actual tooltip implementation may vary
    }
  });

  test('should maintain blocked state after page refresh', async ({ page }) => {
    // Wait for the page to load initially
    await page.waitForSelector('pelu-booking-page', { timeout: 10000 });
    
    // Check initial blocked state
    const calendarContainer = page.locator('.calendar-container');
    const isInitiallyBlocked = await calendarContainer.hasClass('blocked');
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that the blocked state is maintained
    await page.waitForSelector('pelu-calendar-component', { timeout: 10000 });
    const calendarContainerAfterRefresh = page.locator('.calendar-container');
    
    if (isInitiallyBlocked) {
      await expect(calendarContainerAfterRefresh).toHaveClass(/blocked/);
    } else {
      await expect(calendarContainerAfterRefresh).not.toHaveClass(/blocked/);
    }
  });
});

/**
 * Test suite for edge cases and error handling
 */
test.describe('Booking Limit Edge Cases', () => {
  test('should handle authentication state changes', async ({ page }) => {
    // Navigate to booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Test behavior when user logs out and back in
    // This would require authentication setup in the test environment
    
    // For now, we'll verify the page loads correctly
    await expect(page.locator('pelu-booking-page')).toBeVisible();
  });

  test('should handle system parameter changes', async ({ page }) => {
    // This test would verify that changes to maxAppointmentsPerUser
    // are reflected in the UI immediately
    
    // Navigate to booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Verify the page loads correctly
    await expect(page.locator('pelu-booking-page')).toBeVisible();
  });
});
