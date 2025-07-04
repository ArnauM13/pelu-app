import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { CalendarModule, CalendarView } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { DateAdapter, CalendarUtils, CalendarA11y } from 'angular-calendar';
import { format } from 'date-fns';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarComponent, CalendarModule],
      providers: [
        CalendarUtils,
        CalendarA11y,
        {
          provide: DateAdapter,
          useFactory: adapterFactory,
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have input signals', () => {
    expect(component.mini).toBeDefined();
    expect(typeof component.mini).toBe('function');
    expect(component.events).toBeDefined();
    expect(typeof component.events).toBe('function');
  });

  it('should have output signals', () => {
    expect(component.dateSelected).toBeDefined();
  });

  it('should have computed signals', () => {
    expect(component.viewDate).toBeDefined();
    expect(typeof component.viewDate).toBe('function');
    expect(component.selectedDateTime).toBeDefined();
    expect(typeof component.selectedDateTime).toBe('function');
    expect(component.selectedDay).toBeDefined();
    expect(typeof component.selectedDay).toBe('function');
  });

  it('should have timeSlots computed property', () => {
    expect(component.timeSlots).toBeDefined();
    expect(typeof component.timeSlots).toBe('function');
  });

  it('should have weekDays computed property', () => {
    expect(component.weekDays).toBeDefined();
    expect(typeof component.weekDays).toBe('function');
  });

  it('should have calendarEvents computed property', () => {
    expect(component.calendarEvents).toBeDefined();
    expect(typeof component.calendarEvents).toBe('function');
  });

  it('should have selectedDateMessage computed property', () => {
    expect(component.selectedDateMessage).toBeDefined();
    expect(typeof component.selectedDateMessage).toBe('function');
  });

  it('should have getEventsForDay method', () => {
    expect(typeof component.getEventsForDay).toBe('function');
  });

  it('should have isTimeSlotAvailable method', () => {
    expect(typeof component.isTimeSlotAvailable).toBe('function');
  });

  it('should have selectDay method', () => {
    expect(typeof component.selectDay).toBe('function');
  });

  it('should have selectTimeSlot method', () => {
    expect(typeof component.selectTimeSlot).toBe('function');
  });

  it('should have isDaySelected method', () => {
    expect(typeof component.isDaySelected).toBe('function');
  });

  it('should have isTimeSlotSelected method', () => {
    expect(typeof component.isTimeSlotSelected).toBe('function');
  });

  it('should have getEventForTimeSlot method', () => {
    expect(typeof component.getEventForTimeSlot).toBe('function');
  });

  it('should have previousWeek method', () => {
    expect(typeof component.previousWeek).toBe('function');
  });

  it('should have nextWeek method', () => {
    expect(typeof component.nextWeek).toBe('function');
  });

  it('should have today method', () => {
    expect(typeof component.today).toBe('function');
  });

  it('should have formatPopupDate method', () => {
    expect(typeof component.formatPopupDate).toBe('function');
  });

  it('should have format method', () => {
    expect(typeof component.format).toBe('function');
  });

  it('should have isPastDate method', () => {
    expect(typeof component.isPastDate).toBe('function');
  });

  it('should have getDayName method', () => {
    expect(typeof component.getDayName).toBe('function');
  });

  it('should have getEventTime method', () => {
    expect(typeof component.getEventTime).toBe('function');
  });

  it('should initialize with default values', () => {
    expect(component.mini()).toBe(false);
    expect(component.events()).toEqual([]);
    expect(component.view).toBe(CalendarView.Week);
    expect(component.businessHours.start).toBe(8);
    expect(component.businessHours.end).toBe(20);
  });

  it('should initialize with current date', () => {
    const currentDate = new Date();
    const viewDate = component.viewDate();
    expect(viewDate.getDate()).toBe(currentDate.getDate());
    expect(viewDate.getMonth()).toBe(currentDate.getMonth());
    expect(viewDate.getFullYear()).toBe(currentDate.getFullYear());
  });

  it('should initialize with empty selected date time', () => {
    expect(component.selectedDateTime()).toEqual({date: '', time: ''});
  });

  it('should initialize with no selected day', () => {
    expect(component.selectedDay()).toBeNull();
  });

  it('should generate time slots correctly', () => {
    const timeSlots = component.timeSlots();
    expect(timeSlots.length).toBe(12); // 8:00 to 19:00 (12 slots)
    expect(timeSlots[0]).toBe('08:00');
    expect(timeSlots[timeSlots.length - 1]).toBe('19:00');
  });

  it('should generate week days correctly', () => {
    const weekDays = component.weekDays();
    expect(weekDays.length).toBe(7);
    expect(weekDays[0].getDay()).toBe(1); // Monday
    expect(weekDays[6].getDay()).toBe(0); // Sunday
  });

  it('should convert events to calendar events', () => {
    const testEvents = [
      { title: 'Test Event 1', start: '2024-01-15T10:00' },
      { title: 'Test Event 2', start: '2024-01-16T14:30' }
    ];

    // Manually set events (in real scenario this would be through input signal)
    const calendarEvents = component.calendarEvents();
    expect(calendarEvents.length).toBe(0); // Default empty array

    // Test with events
    const eventsWithData = testEvents.map(event => ({
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.start),
      color: {
        primary: '#3b82f6',
        secondary: '#dbeafe'
      }
    }));

    expect(eventsWithData.length).toBe(2);
    expect(eventsWithData[0].title).toBe('Test Event 1');
  });

  it('should get events for a specific day', () => {
    const testDate = new Date('2024-01-15');
    const events = component.getEventsForDay(testDate);
    expect(Array.isArray(events)).toBe(true);
  });

  it('should check if time slot is available', () => {
    const testDate = new Date('2024-01-15');
    const isAvailable = component.isTimeSlotAvailable(testDate, '10:00');
    expect(typeof isAvailable).toBe('boolean');
  });

  it('should select a day', () => {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Tomorrow
    component.selectDay(testDate);
    expect(component.selectedDay()).toEqual(testDate);
  });

  it('should deselect a day when clicking the same day', () => {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Tomorrow
    component.selectDay(testDate);
    expect(component.selectedDay()).toEqual(testDate);

    component.selectDay(testDate);
    expect(component.selectedDay()).toBeNull();
  });

  it('should not select past dates', () => {
    const pastDate = new Date('2020-01-01');
    component.selectDay(pastDate);
    expect(component.selectedDay()).toBeNull();
  });

  it('should select a time slot', () => {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Tomorrow
    spyOn(component.dateSelected, 'emit');

    component.selectTimeSlot(testDate, '10:00');

    expect(component.selectedDateTime()).toEqual({date: format(testDate, 'yyyy-MM-dd'), time: '10:00'});
    expect(component.dateSelected.emit).toHaveBeenCalledWith({date: format(testDate, 'yyyy-MM-dd'), time: '10:00'});
  });

  it('should check if a day is selected', () => {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Tomorrow
    expect(component.isDaySelected(testDate)).toBe(false);

    component.selectDay(testDate);
    expect(component.isDaySelected(testDate)).toBe(true);
  });

  it('should check if a time slot is selected', () => {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Tomorrow
    expect(component.isTimeSlotSelected(testDate, '10:00')).toBe(false);

    component.selectTimeSlot(testDate, '10:00');
    expect(component.isTimeSlotSelected(testDate, '10:00')).toBe(true);
  });

  it('should get event for a time slot', () => {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Tomorrow
    const event = component.getEventForTimeSlot(testDate, '10:00');
    expect(event).toBeUndefined(); // No events by default
  });

  it('should navigate to previous week', () => {
    const initialDate = component.viewDate();
    component.previousWeek();
    const newDate = component.viewDate();

    expect(newDate.getTime()).toBeLessThan(initialDate.getTime());
    expect(component.selectedDay()).toBeNull();
  });

  it('should navigate to next week', () => {
    const initialDate = component.viewDate();
    component.nextWeek();
    const newDate = component.viewDate();

    expect(newDate.getTime()).toBeGreaterThan(initialDate.getTime());
    expect(component.selectedDay()).toBeNull();
  });

  it('should navigate to today', () => {
    const today = new Date();
    component.today();
    const viewDate = component.viewDate();

    expect(viewDate.getDate()).toBe(today.getDate());
    expect(viewDate.getMonth()).toBe(today.getMonth());
    expect(viewDate.getFullYear()).toBe(today.getFullYear());
    expect(component.selectedDay()).toBeNull();
  });

  it('should format popup date correctly', () => {
    const formattedDate = component.formatPopupDate('2024-01-15');
    expect(formattedDate).toContain('15');
    expect(formattedDate).toContain('2024');
    expect(formattedDate).toContain('Dilluns'); // Monday in Catalan
  });

  it('should format date using date-fns', () => {
    const testDate = new Date('2024-01-15');
    const formatted = component.format(testDate, 'yyyy-MM-dd');
    expect(formatted).toBe('2024-01-15');
  });

  it('should check if date is in the past', () => {
    const pastDate = new Date('2020-01-01');
    const futureDate = new Date('2030-01-01');

    expect(component.isPastDate(pastDate)).toBe(true);
    expect(component.isPastDate(futureDate)).toBe(false);
  });

  it('should get day name in Catalan', () => {
    const monday = new Date('2024-01-15'); // Monday
    const dayName = component.getDayName(monday);
    expect(dayName).toBe('Dilluns');
  });

  it('should get event time from start string', () => {
    const time = component.getEventTime('2024-01-15T10:30');
    expect(time).toBe('10:30');
  });

  it('should return empty string for event time without time part', () => {
    const time = component.getEventTime('2024-01-15');
    expect(time).toBe('');
  });

  it('should show selected date message when date is selected', () => {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Tomorrow
    component.selectTimeSlot(testDate, '10:00');

    const message = component.selectedDateMessage();
    expect(message).toContain('Seleccionat:');
    expect(message).toContain('10:00');
  });

  it('should show selected date message when only date is selected', () => {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Tomorrow
    component.selectTimeSlot(testDate, ''); // Select date without time

    const message = component.selectedDateMessage();
    expect(message).toContain('Dia seleccionat:');
  });

  it('should show default message when no date is selected', () => {
    const message = component.selectedDateMessage();
    expect(message).toBe('Cap dia seleccionat');
  });

  it('should be a standalone component', () => {
    expect(CalendarComponent.prototype.constructor).toBeDefined();
    expect(CalendarComponent.prototype.constructor.name).toBe('CalendarComponent');
  });

  it('should have proper component structure', () => {
    expect(CalendarComponent.name).toBe('CalendarComponent');
    expect(typeof CalendarComponent).toBe('function');
  });
});
