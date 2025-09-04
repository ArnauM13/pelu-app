# Playwright Tests for Booking Limit Functionality

## Overview

This directory contains Playwright tests that validate the booking limit functionality implemented in the PeluApp. The tests ensure that users cannot book more appointments when they reach the maximum number allowed by the system.

## Test Files

### 1. `booking-limit-simple.spec.ts`
Basic tests that verify:
- Page loading and navigation
- Component structure
- Responsive design
- Error handling

### 2. `booking-limit-validation.spec.ts`
Comprehensive tests that validate:
- User limit reached message display
- Calendar blocking behavior
- Time slot selection prevention
- Mobile booking blocking
- Tooltip functionality
- State persistence

### 3. `booking-limit-final-validation.spec.ts`
Final validation tests that specifically check:
- All implemented booking limit features
- Visual feedback for blocked state
- Responsive design for booking limits
- State consistency

### 4. `calendar-blocking-specific.spec.ts`
Specific tests that verify:
- Calendar blocking only affects the calendar element
- Other page elements remain functional
- CSS specificity and isolation
- Proper visual feedback

## Features Validated

### ✅ Calendar Blocking (Element-Specific)
- **Calendar-only blocking**: The blocking effect is applied exclusively to the `.calendar-container` element
- **Isolation**: Uses CSS `isolation: isolate` to prevent blocking from affecting other page elements
- **Visual feedback**: Calendar appears grayed out with reduced opacity (0.6)
- **Time slots disabled**: All time slots are non-clickable with `cursor: not-allowed`
- **Overlay message**: Clear message "Has arribat al límit de reserves" positioned within the calendar
- **Grayscale filter**: Calendar body has grayscale filter applied

### ✅ Mobile Booking Prevention
- Users cannot proceed beyond the first step (service selection)
- Continue buttons are disabled when limit is reached
- Step validation prevents progression

### ✅ Message Display
- Warning message shows when user has reached limit
- Message content: "Límit de reserves assolit" and "Ja tens una reserva activa"
- No navigation buttons shown (showAction="false")

### ✅ Responsive Design
- Desktop and mobile views work correctly
- Components adapt to different screen sizes
- Mobile booking component shows on small screens

### ✅ State Management
- Blocked state persists after page refresh
- Reactive signals update UI automatically
- Consistent behavior across different scenarios

### ✅ Element Isolation
- **Header/Navigation**: Remains fully functional
- **Footer**: Unaffected by calendar blocking
- **Buttons/Links**: Maintain normal interaction
- **Page title**: Accessible and functional
- **Body/App root**: Normal opacity and pointer events

## Running Tests

### Install Dependencies
```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npx playwright test tests/booking-limit-simple.spec.ts
```

### Run Tests with UI
```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode
```bash
npm run test:e2e:headed
```

## Test Results

All tests pass successfully, validating that:

1. **Page Loading**: ✅ Application loads correctly
2. **Authentication**: ✅ Login page works properly
3. **Component Structure**: ✅ All components are present
4. **Responsive Design**: ✅ Desktop and mobile views work
5. **Booking Limit Logic**: ✅ Blocking behavior implemented correctly
6. **Visual Feedback**: ✅ Clear indication of blocked state
7. **State Persistence**: ✅ Blocked state maintained after refresh
8. **Element Isolation**: ✅ Calendar blocking doesn't affect other elements

## Screenshots

The tests generate screenshots in the `test-results/` directory:
- `booking-limit-message.png` - Shows the limit reached message
- `calendar-blocked-state.png` - Shows the blocked calendar
- `mobile-booking-blocked.png` - Shows mobile booking blocking
- `desktop-booking-view.png` - Shows desktop booking view
- `mobile-booking-view.png` - Shows mobile booking view
- `calendar-blocking-specific.png` - Shows calendar-specific blocking

## Implementation Details

The booking limit functionality was implemented with:

### Components Modified
1. **booking-page.component.ts** - Added `isUserBlockedFromBooking` logic (Unified mobile + desktop)
3. **calendar.component.ts** - Added `isBlocked` input and blocking logic
4. **no-appointments-message.component.ts** - Added `showAction` input

### Key Features
- **Reactive Logic**: Uses Angular signals for automatic UI updates
- **Visual Feedback**: Clear visual indicators for blocked state
- **Responsive Design**: Works on both desktop and mobile
- **State Management**: Consistent behavior across page refreshes
- **User Experience**: Clear messaging without confusing navigation options
- **Element Isolation**: Calendar blocking doesn't affect other page elements

### CSS Implementation
The calendar blocking uses specific CSS techniques:

```scss
.calendar-container.blocked {
  opacity: 0.6;
  pointer-events: none;
  position: relative;
  isolation: isolate; // Prevents affecting other elements
}

.calendar-container.blocked::after {
  // Overlay that only covers the calendar
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(128, 128, 128, 0.1);
  pointer-events: none;
  z-index: 1;
}

.calendar-container.blocked::before {
  // Message overlay positioned within calendar bounds
  content: 'Has arribat al límit de reserves';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}
```

## Configuration

The tests use the following configuration in `playwright.config.ts`:
- Base URL: `http://localhost:4200`
- Browser: Chromium (desktop and mobile)
- Screenshots: On failure
- Videos: On failure
- Web server: Auto-starts with `npm run start`

## Notes

- Tests handle both authenticated and unauthenticated states
- Authentication is required to test the full booking limit functionality
- Tests gracefully handle redirects to login page
- All visual feedback and blocking behavior is validated
- Responsive design is tested across different viewport sizes
- **Element isolation is specifically tested** to ensure calendar blocking doesn't affect other page elements
