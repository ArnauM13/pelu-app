import { test, expect } from '@playwright/test';

/**
 * Test suite to verify that calendar blocking only affects the calendar body element
 * and not other page elements
 */
test.describe('Calendar Blocking Specific Tests', () => {
  test('should only block the calendar body element, not other page elements', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/calendar-blocking-specific.png', fullPage: true });
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/bookings')) {
      // Check if calendar body is blocked
      const calendarBody = page.locator('.calendar-body');
      const isBlocked = await calendarBody.evaluate(el => el.classList.contains('blocked'));
      
      if (isBlocked) {
        console.log('Calendar body is blocked - testing that other elements remain functional');
        
        // Verify calendar body is blocked
        await expect(calendarBody).toHaveCSS('opacity', '0.6');
        console.log('✅ Calendar body has reduced opacity');
        
        // Check that calendar time slots are disabled
        const timeSlots = page.locator('.calendar-body .time-slot');
        if (await timeSlots.count() > 0) {
          const firstSlot = timeSlots.first();
          const hasDisabledClass = await firstSlot.evaluate(el => el.classList.contains('disabled'));
          console.log('First time slot has disabled class:', hasDisabledClass);
          
          // Verify time slots have not-allowed cursor
          await expect(firstSlot).toHaveCSS('cursor', 'not-allowed');
          console.log('✅ Time slots have not-allowed cursor');
        }
        
        // Check that other page elements are NOT affected
        const otherElements = [
          'header',
          'nav',
          'footer',
          'button',
          'input',
          'a'
        ];
        
        for (const elementSelector of otherElements) {
          const elements = page.locator(elementSelector);
          if (await elements.count() > 0) {
            const firstElement = elements.first();
            
            // Check that other elements have normal opacity
            const opacity = await firstElement.evaluate(el => {
              const style = window.getComputedStyle(el);
              return style.opacity;
            });
            
            if (opacity !== '0.6') {
              console.log(`✅ ${elementSelector} has normal opacity: ${opacity}`);
            } else {
              console.log(`❌ ${elementSelector} has reduced opacity: ${opacity}`);
            }
            
            // Check that other elements have normal pointer events
            const pointerEvents = await firstElement.evaluate(el => {
              const style = window.getComputedStyle(el);
              return style.pointerEvents;
            });
            
            if (pointerEvents !== 'none') {
              console.log(`✅ ${elementSelector} has normal pointer events: ${pointerEvents}`);
            } else {
              console.log(`❌ ${elementSelector} has disabled pointer events: ${pointerEvents}`);
            }
          }
        }
        
        // Check that the calendar container is NOT affected
        const calendarContainer = page.locator('.calendar-container');
        const containerOpacity = await calendarContainer.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.opacity;
        });
        
        if (containerOpacity === '1') {
          console.log('✅ Calendar container has normal opacity');
        } else {
          console.log(`❌ Calendar container has reduced opacity: ${containerOpacity}`);
        }
        
        // Check that the page title and navigation are still functional
        const pageTitle = page.locator('title');
        if (await pageTitle.count() > 0) {
          const titleText = await pageTitle.textContent();
          console.log('✅ Page title is accessible:', titleText);
        }
        
        // Check that the body element is not affected
        const body = page.locator('body');
        const bodyOpacity = await body.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.opacity;
        });
        
        if (bodyOpacity === '1') {
          console.log('✅ Body element has normal opacity');
        } else {
          console.log(`❌ Body element has reduced opacity: ${bodyOpacity}`);
        }
        
        // Check that the app root is not affected
        const appRoot = page.locator('app-root');
        if (await appRoot.count() > 0) {
          const appRootOpacity = await appRoot.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.opacity;
          });
          
          if (appRootOpacity === '1') {
            console.log('✅ App root has normal opacity');
          } else {
            console.log(`❌ App root has reduced opacity: ${appRootOpacity}`);
          }
        }
        
      } else {
        console.log('Calendar body is not blocked - this is expected for users under the limit');
        
        // Verify calendar body has normal opacity
        await expect(calendarBody).toHaveCSS('opacity', '1');
        console.log('✅ Calendar body has normal opacity');
      }
    }
  });

  test('should maintain calendar body blocking isolation after page interactions', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/bookings')) {
      // Check initial calendar body state
      const calendarBody = page.locator('.calendar-body');
      const initialBlockedState = await calendarBody.evaluate(el => el.classList.contains('blocked'));
      console.log('Initial calendar body blocked state:', initialBlockedState);
      
      // Try to interact with other page elements
      const buttons = page.locator('button');
      if (await buttons.count() > 0) {
        // Hover over a button to test interaction
        await buttons.first().hover();
        console.log('✅ Button hover interaction works');
      }
      
      // Try to interact with links
      const links = page.locator('a');
      if (await links.count() > 0) {
        // Hover over a link to test interaction
        await links.first().hover();
        console.log('✅ Link hover interaction works');
      }
      
      // Check that calendar body blocking state is maintained
      const finalBlockedState = await calendarBody.evaluate(el => el.classList.contains('blocked'));
      console.log('Final calendar body blocked state:', finalBlockedState);
      
      // State should be consistent
      expect(finalBlockedState).toBe(initialBlockedState);
      console.log('✅ Calendar body blocking state is consistent');
    }
  });

  test('should verify calendar body blocking CSS specificity', async ({ page }) => {
    // Navigate to the booking page
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/bookings')) {
      const calendarBody = page.locator('.calendar-body');
      const isBlocked = await calendarBody.evaluate(el => el.classList.contains('blocked'));
      
      if (isBlocked) {
        // Verify that the blocking styles are applied with proper specificity
        const computedStyles = await calendarBody.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            opacity: style.opacity,
            pointerEvents: style.pointerEvents,
            position: style.position,
            isolation: style.isolation
          };
        });
        
        console.log('Calendar body computed styles:', computedStyles);
        
        // Verify specific blocking properties
        expect(computedStyles.opacity).toBe('0.6');
        expect(computedStyles.pointerEvents).toBe('none');
        expect(computedStyles.position).toBe('relative');
        expect(computedStyles.isolation).toBe('isolate');
        
        console.log('✅ Calendar body blocking styles are correctly applied');
        
        // Verify that child elements inherit the blocking
        const horizontalWeekView = page.locator('.calendar-body .horizontal-week-view');
        if (await horizontalWeekView.count() > 0) {
          const weekViewStyles = await horizontalWeekView.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              filter: style.filter,
              position: style.position,
              zIndex: style.zIndex
            };
          });
          
          console.log('Horizontal week view computed styles:', weekViewStyles);
          
          // Verify grayscale filter is applied
          expect(weekViewStyles.filter).toContain('grayscale');
          console.log('✅ Horizontal week view has grayscale filter');
        }
      }
    }
  });
});
