# Reactive Positioning System for Calendar

## Overview

The calendar module now includes a reactive positioning system that automatically recalculates the position of elements in the grid based on booking duration parameters. This system uses Angular signals to provide real-time updates whenever the booking duration changes.

## Key Features

### 🎯 Reactive Grid Positioning
- **Automatic Recalculation**: All appointment positions are automatically recalculated when booking duration changes
- **Real-time Updates**: Uses Angular signals for immediate UI updates
- **Consistent Positioning**: All elements (appointments, time slots, drop indicators) use the same reactive system

### 📐 Dynamic Duration Support
- **Flexible Booking Duration**: Support for any booking duration (30min, 60min, 90min, etc.)
- **Slot Duration Control**: Independent control over time slot duration
- **Pixel-perfect Positioning**: Precise positioning based on duration and grid configuration

## How to Use

### 1. Update Booking Duration

```typescript
// In your component
import { CalendarCoreService } from './features/calendar/services/calendar-core.service';

export class YourComponent {
  constructor(private calendarCoreService: CalendarCoreService) {}

  // Update booking duration (in minutes)
  updateBookingDuration(durationMinutes: number): void {
    this.calendarCoreService.updateBookingDuration(durationMinutes);
  }

  // Get current booking duration
  getCurrentBookingDuration(): number {
    return this.calendarCoreService.reactiveBookingDuration();
  }
}
```

### 2. Update Slot Duration

```typescript
// Update time slot duration (in minutes)
updateSlotDuration(durationMinutes: number): void {
  this.calendarCoreService.updateGridConfiguration({
    slotDurationMinutes: durationMinutes
  });
}
```

### 3. Update Grid Configuration

```typescript
// Update multiple grid parameters at once
updateGridConfiguration(): void {
  this.calendarCoreService.updateGridConfiguration({
    slotHeightPx: 40,           // Height of each time slot in pixels
    pixelsPerMinute: 1.5,       // Pixels per minute for appointment height
    slotDurationMinutes: 30,    // Duration of each time slot
    bookingDurationMinutes: 60, // Default booking duration
    businessStartHour: 8,       // Business start hour
    businessEndHour: 20,        // Business end hour
    lunchBreakStart: 13,        // Lunch break start hour
    lunchBreakEnd: 15          // Lunch break end hour
  });
}
```

## Reactive Signals

The system uses several reactive signals that automatically update when dependencies change:

### Core Reactive Signals
```typescript
// These signals automatically recalculate when grid configuration changes
readonly reactiveSlotHeight = computed(() => this.gridConfiguration().slotHeightPx);
readonly reactivePixelsPerMinute = computed(() => this.gridConfiguration().pixelsPerMinute);
readonly reactiveSlotDuration = computed(() => this.gridConfiguration().slotDurationMinutes);
readonly reactiveBookingDuration = computed(() => this.gridConfiguration().bookingDurationMinutes);
```

### Position Calculation
```typescript
// Reactive appointment position calculation
calculateReactiveAppointmentPosition(appointment: AppointmentEvent): AppointmentPosition {
  const top = this.timeToCoordinate(timeString);
  const height = (appointment.duration || this.reactiveBookingDuration()) * this.reactivePixelsPerMinute();
  return { top, height };
}
```

## Example: Dynamic Duration Changes

```typescript
// Demo showing how positions automatically update
demoReactivePositioning(): void {
  // Start with 30-minute bookings
  this.updateBookingDuration(30);
  
  // After 2 seconds, switch to 60-minute bookings
  setTimeout(() => {
    this.updateBookingDuration(60);
  }, 2000);
  
  // After 4 seconds, switch to 90-minute bookings
  setTimeout(() => {
    this.updateBookingDuration(90);
  }, 4000);
}
```

## Technical Implementation

### 1. Signal-based Architecture
- Uses Angular signals for reactive state management
- All position calculations are computed signals
- Automatic dependency tracking and updates

### 2. Grid Configuration
```typescript
export interface GridConfiguration {
  slotHeightPx: number;
  pixelsPerMinute: number;
  slotDurationMinutes: number;
  businessStartHour: number;
  businessEndHour: number;
  lunchBreakStart: number;
  lunchBreakEnd: number;
  bookingDurationMinutes: number; // New reactive parameter
}
```

### 3. Position Calculation
```typescript
// Time to coordinate conversion
timeToCoordinate(time: string): number {
  const slotHeight = this.reactiveSlotHeight();
  const [hours, minutes] = time.split(':').map(Number);
  const minutesSinceStart = (hours - config.businessStartHour) * 60 + minutes;
  const slotIndex = minutesSinceStart / config.slotDurationMinutes;
  return slotIndex * slotHeight;
}

// Coordinate to time conversion
coordinateToTime(yPosition: number): string {
  const slotHeight = this.reactiveSlotHeight();
  const slotIndex = Math.round(yPosition / slotHeight);
  const totalMinutes = config.businessStartHour * 60 + slotIndex * config.slotDurationMinutes;
  // ... time calculation
}
```

## Benefits

### ✅ Automatic Updates
- No manual position recalculation needed
- UI updates immediately when parameters change
- Consistent positioning across all components

### ✅ Performance
- Efficient signal-based updates
- Only recalculates when dependencies change
- Minimal performance impact

### ✅ Flexibility
- Support for any booking duration
- Independent control over slot and booking durations
- Easy to extend with new parameters

### ✅ Consistency
- All components use the same positioning system
- Consistent behavior across drag-and-drop, time slots, and appointments
- Unified grid configuration

## Usage in Components

### Calendar Component
```typescript
// The calendar component automatically uses reactive positioning
readonly appointmentPositions = computed(() => {
  const appointments = this.allEvents();
  return this.calendarCoreService.getAppointmentPositions(appointments);
});
```

### Appointment Slot Component
```typescript
// Appointment slots automatically recalculate positions
readonly position = computed(() => {
  if (!this.data() || !this.data()!.appointment) return { top: 0, height: 0 };
  return this.calendarCoreService.calculateReactiveAppointmentPosition(this.data()!.appointment!);
});
```

## Debugging

### Grid Configuration Changes
The system logs grid configuration changes for debugging:
```typescript
constructor() {
  effect(() => {
    const config = this.gridConfiguration();
    console.log('Grid configuration updated:', config);
  });
}
```

### Position Calculation
All position calculations include detailed logging:
```typescript
coordinateToTime(yPosition: number): string {
  // ... calculation
  console.log('coordinateToTime:', {
    yPosition,
    config,
    slotIndex,
    totalMinutes,
    hours,
    minutes,
    clampedHours,
    result,
  });
  return result;
}
```

## Migration Guide

### From Static Positioning
If you're migrating from a static positioning system:

1. **Replace static calculations** with reactive signals
2. **Update position methods** to use `calculateReactiveAppointmentPosition`
3. **Use reactive parameters** instead of hardcoded values
4. **Add duration updates** where needed

### Example Migration
```typescript
// Before (static)
const height = appointment.duration * 1; // Hardcoded pixels per minute

// After (reactive)
const height = (appointment.duration || this.reactiveBookingDuration()) * this.reactivePixelsPerMinute();
```

This reactive positioning system provides a robust, flexible, and performant solution for dynamic calendar grid positioning based on booking duration parameters. 
