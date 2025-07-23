import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CalendarTimeColumnComponent, TimeSlot } from './calendar-time-column.component';

// Test host component to provide required inputs
@Component({
  template: ` <pelu-calendar-time-column [timeSlots]="testTimeSlots"></pelu-calendar-time-column> `,
  imports: [CalendarTimeColumnComponent],
})
class TestHostComponent {
  testTimeSlots: TimeSlot[] = [
    { time: '08:00', isBlocked: false, isLunchBreakStart: false, isDisabled: false },
    { time: '08:30', isBlocked: false, isLunchBreakStart: false, isDisabled: false },
    { time: '12:00', isBlocked: true, isLunchBreakStart: true, isDisabled: true },
    { time: '12:30', isBlocked: true, isLunchBreakStart: false, isDisabled: true },
    { time: '13:00', isBlocked: true, isLunchBreakStart: false, isDisabled: true },
    { time: '13:30', isBlocked: false, isLunchBreakStart: false, isDisabled: false },
  ];
}

describe('CalendarTimeColumnComponent', () => {
  let component: CalendarTimeColumnComponent;
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  const mockTimeSlots: TimeSlot[] = [
    { time: '08:00', isBlocked: false, isLunchBreakStart: false, isDisabled: false },
    { time: '08:30', isBlocked: false, isLunchBreakStart: false, isDisabled: false },
    { time: '12:00', isBlocked: true, isLunchBreakStart: true, isDisabled: true },
    { time: '12:30', isBlocked: true, isLunchBreakStart: false, isDisabled: true },
    { time: '13:00', isBlocked: true, isLunchBreakStart: false, isDisabled: true },
    { time: '13:30', isBlocked: false, isLunchBreakStart: false, isDisabled: false },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    component = hostFixture.debugElement.children[0].componentInstance;
    hostFixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have timeSlots input signal', () => {
    expect(component.timeSlots).toBeDefined();
    expect(typeof component.timeSlots).toBe('function');
  });

  it('should display time header', () => {
    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.time-header').textContent).toContain('Hora');
  });

  it('should render all time slots', () => {
    const compiled = hostFixture.nativeElement;
    const timeSlotLabels = compiled.querySelectorAll('.time-slot-label');
    expect(timeSlotLabels.length).toBe(mockTimeSlots.length);
  });

  it('should display correct time values', () => {
    const compiled = hostFixture.nativeElement;
    const timeSlotLabels = compiled.querySelectorAll('.time-slot-label');

    mockTimeSlots.forEach((slot, index) => {
      expect(timeSlotLabels[index].textContent.trim()).toBe(slot.time);
    });
  });

  it('should apply lunch break styles correctly', () => {
    const compiled = hostFixture.nativeElement;
    const timeSlotLabels = compiled.querySelectorAll('.time-slot-label');

    // Check lunch break start (12:00)
    expect(timeSlotLabels[2].classList.contains('lunch-break')).toBe(true);
    expect(timeSlotLabels[2].classList.contains('lunch-break-start')).toBe(true);
    expect(timeSlotLabels[2].classList.contains('disabled')).toBe(true);

    // Check regular lunch break time (12:30)
    expect(timeSlotLabels[3].classList.contains('lunch-break')).toBe(true);
    expect(timeSlotLabels[3].classList.contains('lunch-break-start')).toBe(false);
    expect(timeSlotLabels[3].classList.contains('disabled')).toBe(true);
  });

  it('should apply regular time slot styles correctly', () => {
    const compiled = hostFixture.nativeElement;
    const timeSlotLabels = compiled.querySelectorAll('.time-slot-label');

    // Check regular time slot (08:00)
    expect(timeSlotLabels[0].classList.contains('lunch-break')).toBe(false);
    expect(timeSlotLabels[0].classList.contains('lunch-break-start')).toBe(false);
    expect(timeSlotLabels[0].classList.contains('disabled')).toBe(false);
  });

  it('should have correct CSS classes', () => {
    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.time-column')).toBeTruthy();
    expect(compiled.querySelector('.time-header')).toBeTruthy();
  });
});
