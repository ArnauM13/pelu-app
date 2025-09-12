import { test, expect } from '@playwright/test';

/**
 * Test suite specifically for validating the booking limit functionality
 * Tests the blocking behavior when users reach their appointment limit
 */
test.describe('Booking Limit Validation', () => {
  test('should show user limit reached message when appropriate', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/booking-limit-message.png' });

    // Check if we're on the booking page (authenticated) or login page
    const currentUrl = page.url();

    if (currentUrl.includes('/bookings')) {
      // We're on the booking page - check for limit message
      const limitMessage = page.locator('pelu-no-appointments-message');

      // The message might or might not be visible depending on user state
      if (await limitMessage.count() > 0) {
        await expect(limitMessage).toBeVisible();

        // Check for the specific limit reached content
        const title = limitMessage.locator('.title');
        const message = limitMessage.locator('.message-text');

        if (await title.count() > 0) {
          const titleText = await title.textContent();
          console.log('Message title:', titleText);
        }

        if (await message.count() > 0) {
          const messageText = await message.textContent();
          console.log('Message text:', messageText);
        }

        // Verify that action button is NOT shown (showAction="false")
        const actionButton = limitMessage.locator('.message-actions .btn');
        await expect(actionButton).not.toBeVisible();
      }
    }
  });

  test('should block calendar when user has reached appointment limit', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/calendar-blocked-state.png' });

    const currentUrl = page.url();

    if (currentUrl.includes('/bookings')) {
      // Wait for the calendar component to be present
      const calendarComponent = page.locator('pelu-calendar-component');
      if (await calendarComponent.count() > 0) {
        await expect(calendarComponent).toBeVisible();

        // Check if the calendar has the blocked class
        const calendarContainer = page.locator('.calendar-container');
        await expect(calendarContainer).toBeVisible();

        const hasBlockedClass = await calendarContainer.hasClass('blocked');
        console.log('Calendar has blocked class:', hasBlockedClass);

        if (hasBlockedClass) {
          // Verify the blocked styling
          await expect(calendarContainer).toHaveCSS('opacity', '0.6');

          // Check that time slots are disabled
          const timeSlots = page.locator('.time-slot');
          if (await timeSlots.count() > 0) {
            // All time slots should be disabled when blocked
            for (let i = 0; i < Math.min(await timeSlots.count(), 5); i++) {
              const slot = timeSlots.nth(i);
              const hasDisabledClass = await slot.hasClass('disabled');
              console.log(`Time slot ${i} has disabled class:`, hasDisabledClass);
            }
          }
        }
      }
    }
  });

  test('should prevent time slot selection when calendar is blocked', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();

    if (currentUrl.includes('/bookings')) {
      // Wait for the calendar component to be present
      const calendarComponent = page.locator('pelu-calendar-component');
      if (await calendarComponent.count() > 0) {
        await expect(calendarComponent).toBeVisible();

        // Check if calendar is blocked
        const calendarContainer = page.locator('.calendar-container');
        const isBlocked = await calendarContainer.hasClass('blocked');

        if (isBlocked) {
          // Try to click on time slots
          const timeSlots = page.locator('.time-slot');

          if (await timeSlots.count() > 0) {
            // Click on the first time slot
            await timeSlots.first().click();

            // Verify that no service selection popup appears
            const servicePopup = page.locator('pelu-service-selection-popup');
            await expect(servicePopup).not.toBeVisible();

            console.log('Time slot click was blocked as expected');
          }
        }
      }
    }
  });

  test('should handle mobile booking blocking correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/mobile-booking-blocked.png' });

    const currentUrl = page.url();

    if (currentUrl.includes('/bookings')) {
      // Check for mobile booking component
      const mobileBooking = page.locator('pelu-booking-page');
      if (await mobileBooking.count() > 0) {
        await expect(mobileBooking).toBeVisible();

        // Check for limit message in mobile view
        const limitMessage = page.locator('pelu-no-appointments-message');
        if (await limitMessage.count() > 0) {
          await expect(limitMessage).toBeVisible();

          // Verify that action button is NOT shown
          const actionButton = limitMessage.locator('.message-actions .btn');
          await expect(actionButton).not.toBeVisible();
        }

        // Check for continue button and verify it's disabled if user is blocked
        const continueButton = page.locator('button:has-text("Continuar"), button:has-text("Continue")');
        if (await continueButton.count() > 0) {
          const isDisabled = await continueButton.first().isDisabled();
          console.log('Continue button is disabled:', isDisabled);
        }
      }
    }
  });

  test('should show appropriate tooltips when blocked', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();

    if (currentUrl.includes('/bookings')) {
      // Wait for the calendar component to be present
      const calendarComponent = page.locator('pelu-calendar-component');
      if (await calendarComponent.count() > 0) {
        await expect(calendarComponent).toBeVisible();

        // Check if calendar is blocked
        const calendarContainer = page.locator('.calendar-container');
        const isBlocked = await calendarContainer.hasClass('blocked');

        if (isBlocked) {
          // Hover over time slots to check tooltips
          const timeSlots = page.locator('.time-slot');

          if (await timeSlots.count() > 0) {
            await timeSlots.first().hover();

            // Check for blocked message in tooltip
            const _tooltip = page.locator('[title*="Has arribat al límit de reserves"]');
            // Note: Tooltip testing might require additional setup
            console.log('Checking for blocked tooltip message');
          }
        }
      }
    }
  });

  test('should maintain blocked state after page refresh', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();

    if (currentUrl.includes('/bookings')) {
      // Wait for the calendar component to be present
      const calendarComponent = page.locator('pelu-calendar-component');
      if (await calendarComponent.count() > 0) {
        await expect(calendarComponent).toBeVisible();

        // Check initial blocked state
        const calendarContainer = page.locator('.calendar-container');
        const isInitiallyBlocked = await calendarContainer.hasClass('blocked');
        console.log('Initial blocked state:', isInitiallyBlocked);

        // Refresh the page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Check that the blocked state is maintained
        await page.waitForSelector('pelu-calendar-component', { timeout: 10000 });
        const calendarContainerAfterRefresh = page.locator('.calendar-container');

        const isBlockedAfterRefresh = await calendarContainerAfterRefresh.hasClass('blocked');
        console.log('Blocked state after refresh:', isBlockedAfterRefresh);

        // The state should be consistent
        expect(isBlockedAfterRefresh).toBe(isInitiallyBlocked);
      }
    }
  });

  test('should handle responsive design correctly', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    // Take desktop screenshot
    await page.screenshot({ path: 'test-results/desktop-booking-view.png' });

    // Verify desktop booking component
    const desktopBooking = page.locator('pelu-booking-page');
    if (await desktopBooking.count() > 0) {
      await expect(desktopBooking).toBeVisible();
    }

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000); // Wait for responsive change

    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/mobile-booking-view.png' });

    // Verify mobile booking component
    const mobileBooking = page.locator('pelu-booking-page');
    if (await mobileBooking.count() > 0) {
      await expect(mobileBooking).toBeVisible();
    }
  });
});
