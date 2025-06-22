import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarComponent } from './calendar.component';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have getTimeSlots method', () => {
    expect(typeof component.getTimeSlots).toBe('function');
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

  it('should have previousWeek method', () => {
    expect(typeof component.previousWeek).toBe('function');
  });

  it('should have nextWeek method', () => {
    expect(typeof component.nextWeek).toBe('function');
  });

  it('should have today method', () => {
    expect(typeof component.today).toBe('function');
  });

  it('should have getSelectedDateMessage method', () => {
    expect(typeof component.getSelectedDateMessage).toBe('function');
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
});
