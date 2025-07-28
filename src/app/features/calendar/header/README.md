# Calendar Header Component - Simplified

## Overview

A super simple Angular 18 component for calendar navigation with minimal dependencies and maximum clarity.

## Features

### 1. Angular 18 Signals
```typescript
// Input signals
readonly viewDateInfo = input<string>('');
readonly businessDaysInfo = input<string>('');
readonly mainTitle = input<string>('');
readonly canNavigateToPreviousWeek = input<boolean>(true);
readonly currentViewDate = input<Date>(new Date());

// Output signals
readonly today = output<void>();
readonly previousWeek = output<void>();
readonly nextWeek = output<void>();
readonly dateChange = output<string>();

// Computed properties
readonly currentDateString = computed(() =>
  format(this.currentViewDate(), 'yyyy-MM-dd')
);
readonly todayDate = computed(() => new Date());
```

### 2. Static Literals
```typescript
// Static literals for UI text
readonly todayLabel = 'Avui';
readonly previousWeekLabel = 'Setmana anterior';
readonly nextWeekLabel = 'Pròxima setmana';
readonly goToTodayLabel = 'Anar a avui';
```

### 3. Simple Navigation
```typescript
onToday(): void {
  this.today.emit();
}

onPreviousWeek(): void {
  this.previousWeek.emit();
}

onNextWeek(): void {
  this.nextWeek.emit();
}

onDateChange(date: Date | string | null): void {
  if (date instanceof Date) {
    const dateString = format(date, 'yyyy-MM-dd');
    this.dateChange.emit(dateString);
  } else if (typeof date === 'string') {
    this.dateChange.emit(date);
  }
}
```

### 4. Template
```html
<div class="calendar-header">
  <div class="calendar-navigation">
    <!-- Previous Week Button -->
    <pelu-button
      icon="pi pi-chevron-left"
      [disabled]="!canNavigateToPreviousWeek()"
      [ariaLabel]="previousWeekLabel"
      size="small"
      severity="secondary"
      variant="outlined"
      (clicked)="onPreviousWeek()"
    >
    </pelu-button>

    <!-- Today Button -->
    <pelu-button
      [label]="todayLabel"
      [ariaLabel]="goToTodayLabel"
      size="small"
      severity="primary"
      variant="outlined"
      (clicked)="onToday()"
    >
    </pelu-button>

    <!-- Next Week Button -->
    <pelu-button
      icon="pi pi-chevron-right"
      [ariaLabel]="nextWeekLabel"
      size="small"
      severity="secondary"
      variant="outlined"
      (clicked)="onNextWeek()"
    >
    </pelu-button>
  </div>

  <!-- Date Input -->
  <div class="date-input-container">
    <pelu-input-date
      [value]="currentViewDate()"
      [dateFormat]="'dd/mm/yy'"
      [showIcon]="true"
      [showButtonBar]="true"
      [inline]="false"
      [minDate]="todayDate()"
      [preventPastMonths]="true"
      (valueChange)="onDateChange($event)"
    >
    </pelu-input-date>
  </div>

  <div class="calendar-title">
    <div class="title-main">{{ mainTitle() }}</div>
    <div class="title-info">{{ viewDateInfo() }}</div>
    <div class="title-config">{{ businessDaysInfo() }}</div>
  </div>
</div>
```

## Usage

```typescript
<pelu-calendar-header
  [mainTitle]="'Setmana del ' + formatPopupDate(format(viewDate(), 'yyyy-MM-dd'))"
  [viewDateInfo]="getViewDateInfo()"
  [businessDaysInfo]="getBusinessDaysInfo()"
  [canNavigateToPreviousWeek]="canNavigateToPreviousWeek()"
  [currentViewDate]="viewDate()"
  (today)="today()"
  (previousWeek)="previousWeek()"
  (nextWeek)="nextWeek()"
  (dateChange)="onDateChange($event)"
/>
```

## Benefits

### Simplicity
- **No external dependencies** (except Angular core and date-fns)
- **Static literals** - simple properties, no translation complexity
- **Minimal code** - easy to understand and maintain
- **Clear purpose** - navigation and date selection only

### Performance
- **OnPush change detection**
- **Signal-based reactivity**
- **No unnecessary computations**
- **Lightweight bundle**

### Maintainability
- **Single responsibility** - navigation only
- **No complex services** - direct event emission
- **Easy to test** - minimal mocking required
- **Clear API** - simple input/output interface
- **Static literals** - easy to modify text

## Testing

Simple tests covering:
- Component creation
- Static literals verification
- Signal behavior
- Navigation methods
- Template rendering
- Button interactions

```bash
ng test --include="**/calendar-header.component.spec.ts"
```

## What Was Removed

- ❌ Translation service dependency
- ❌ 30+ translation literals
- ❌ Complex computed properties
- ❌ Service injection complexity
- ❌ Extensive test mocking
- ❌ Over-engineered architecture

## What Remains

- ✅ Essential navigation functionality
- ✅ Date input integration
- ✅ Angular 18 signals
- ✅ PrimeNG button integration
- ✅ Static literals for UI text
- ✅ Clean, readable code
- ✅ Simple, focused purpose 
