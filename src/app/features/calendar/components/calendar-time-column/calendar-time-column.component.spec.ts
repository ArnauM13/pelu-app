import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarTimeColumnComponent, TimeSlot } from './calendar-time-column.component';

describe('CalendarTimeColumnComponent', () => {
  let component: CalendarTimeColumnComponent;
  let fixture: ComponentFixture<CalendarTimeColumnComponent>;

  const mockTimeSlots: TimeSlot[] = [
    { time: '08:00', isBlocked: false, isLunchBreakStart: false, isDisabled: false },
    { time: '08:30', isBlocked: false, isLunchBreakStart: false, isDisabled: false },
    { time: '12:00', isBlocked: true, isLunchBreakStart: true, isDisabled: true },
    { time: '12:30', isBlocked: true, isLunchBreakStart: false, isDisabled: true },
    { time: '13:00', isBlocked: true, isLunchBreakStart: false, isDisabled: true },
    { time: '13:30', isBlocked: false, isLunchBreakStart: false, isDisabled: false }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarTimeColumnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarTimeColumnComponent);
    component = fixture.componentInstance;
    // Set the input signal using TestBed
    TestBed.runInInjectionContext(() => {
      (component.timeSlots as any).set(mockTimeSlots);
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display time header', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.time-header').textContent).toContain('Hora');
  });

  it('should render all time slots', () => {
    const compiled = fixture.nativeElement;
    const timeSlotLabels = compiled.querySelectorAll('.time-slot-label');
    expect(timeSlotLabels.length).toBe(mockTimeSlots.length);
  });

  it('should display correct time values', () => {
    const compiled = fixture.nativeElement;
    const timeSlotLabels = compiled.querySelectorAll('.time-slot-label');

    mockTimeSlots.forEach((slot, index) => {
      expect(timeSlotLabels[index].textContent.trim()).toBe(slot.time);
    });
  });

  it('should apply lunch break styles correctly', () => {
    const compiled = fixture.nativeElement;
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
    const compiled = fixture.nativeElement;
    const timeSlotLabels = compiled.querySelectorAll('.time-slot-label');

    // Check regular time slot (08:00)
    expect(timeSlotLabels[0].classList.contains('lunch-break')).toBe(false);
    expect(timeSlotLabels[0].classList.contains('lunch-break-start')).toBe(false);
    expect(timeSlotLabels[0].classList.contains('disabled')).toBe(false);
  });

  it('should have correct CSS classes', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.time-column')).toBeTruthy();
    expect(compiled.querySelector('.time-header')).toBeTruthy();
  });
});
