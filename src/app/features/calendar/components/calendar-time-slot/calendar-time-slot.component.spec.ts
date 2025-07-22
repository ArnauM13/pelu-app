import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarTimeSlotComponent, TimeSlotData } from './calendar-time-slot.component';

describe('CalendarTimeSlotComponent', () => {
  let component: CalendarTimeSlotComponent;
  let fixture: ComponentFixture<CalendarTimeSlotComponent>;

  const mockTimeSlotData: TimeSlotData = {
    date: new Date('2024-01-15'),
    time: '10:00',
    isAvailable: true,
    isBooked: false,
    isLunchBreak: false,
    isPastDate: false,
    isPastTime: false,
    isClickable: true,
    isDisabled: false,
    tooltip: 'Available slot'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarTimeSlotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarTimeSlotComponent);
    component = fixture.componentInstance;
    TestBed.runInInjectionContext(() => {
      (component.data as any).set(mockTimeSlotData);
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply available styles when slot is available', () => {
    const compiled = fixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    expect(timeSlot.classList.contains('available')).toBe(true);
    expect(timeSlot.classList.contains('clickable')).toBe(true);
    expect(timeSlot.classList.contains('booked')).toBe(false);
    expect(timeSlot.classList.contains('lunch-break')).toBe(false);
  });

  it('should apply booked styles when slot is booked', () => {
    const bookedData = { ...mockTimeSlotData, isAvailable: false, isBooked: true, isClickable: false };
    TestBed.runInInjectionContext(() => {
      (component.data as any).set(bookedData);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    expect(timeSlot.classList.contains('booked')).toBe(true);
    expect(timeSlot.classList.contains('available')).toBe(false);
    expect(timeSlot.classList.contains('clickable')).toBe(false);
  });

  it('should apply lunch break styles when slot is lunch break', () => {
    const lunchBreakData = { ...mockTimeSlotData, isLunchBreak: true, isClickable: false, isDisabled: true };
    TestBed.runInInjectionContext(() => {
      (component.data as any).set(lunchBreakData);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    expect(timeSlot.classList.contains('lunch-break')).toBe(true);
    expect(timeSlot.classList.contains('disabled')).toBe(true);
  });

  it('should apply past date styles when date is in the past', () => {
    const pastData = { ...mockTimeSlotData, isPastDate: true, isClickable: false, isDisabled: true };
    TestBed.runInInjectionContext(() => {
      (component.data as any).set(pastData);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    expect(timeSlot.classList.contains('past-date')).toBe(true);
    expect(timeSlot.classList.contains('disabled')).toBe(true);
  });

  it('should apply past time styles when time is in the past', () => {
    const pastTimeData = { ...mockTimeSlotData, isPastTime: true, isClickable: false, isDisabled: true };
    TestBed.runInInjectionContext(() => {
      (component.data as any).set(pastTimeData);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    expect(timeSlot.classList.contains('past-time')).toBe(true);
    expect(timeSlot.classList.contains('disabled')).toBe(true);
  });

  it('should display correct tooltip', () => {
    const compiled = fixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    expect(timeSlot.getAttribute('title')).toBe('Available slot');
  });

  it('should emit click event when slot is clickable', () => {
    const compiled = fixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    spyOn(component.clicked, 'emit');

    timeSlot.click();

    expect(component.clicked.emit).toHaveBeenCalledWith({
      date: mockTimeSlotData.date,
      time: mockTimeSlotData.time
    });
  });

  it('should not emit click event when slot is not clickable', () => {
    const disabledData = { ...mockTimeSlotData, isClickable: false };
    TestBed.runInInjectionContext(() => {
      (component.data as any).set(disabledData);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    spyOn(component.clicked, 'emit');

    timeSlot.click();

    expect(component.clicked.emit).not.toHaveBeenCalled();
  });
});
