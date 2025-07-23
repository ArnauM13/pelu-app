import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CalendarTimeSlotComponent, TimeSlotData } from './calendar-time-slot.component';

// Test host component to provide required inputs
@Component({
  template: `
    <pelu-calendar-time-slot
      [data]="testData"
      (clicked)="onClicked($event)"
    ></pelu-calendar-time-slot>
  `,
  imports: [CalendarTimeSlotComponent],
})
class TestHostComponent {
  testData: TimeSlotData = {
    date: new Date('2024-01-15'),
    time: '10:00',
    isAvailable: true,
    isBooked: false,
    isLunchBreak: false,
    isPastDate: false,
    isPastTime: false,
    isClickable: true,
    isDisabled: false,
    tooltip: 'Available slot',
  };

  onClicked(event: any) {
    // Handle click event
  }
}

describe('CalendarTimeSlotComponent', () => {
  let component: CalendarTimeSlotComponent;
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

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
    tooltip: 'Available slot',
  };

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

  it('should have data input signal', () => {
    expect(component.data).toBeDefined();
    expect(typeof component.data).toBe('function');
  });

  it('should apply available styles when slot is available', () => {
    const compiled = hostFixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    expect(timeSlot.classList.contains('available')).toBe(true);
    expect(timeSlot.classList.contains('clickable')).toBe(true);
    expect(timeSlot.classList.contains('booked')).toBe(false);
    expect(timeSlot.classList.contains('lunch-break')).toBe(false);
  });

  it('should apply booked styles when slot is booked', () => {
    hostComponent.testData = {
      ...mockTimeSlotData,
      isAvailable: false,
      isBooked: true,
      isClickable: false,
    };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    expect(timeSlot.classList.contains('booked')).toBe(true);
    expect(timeSlot.classList.contains('available')).toBe(false);
    expect(timeSlot.classList.contains('clickable')).toBe(false);
  });

  it('should apply lunch break styles when slot is lunch break', () => {
    hostComponent.testData = {
      ...mockTimeSlotData,
      isLunchBreak: true,
      isClickable: false,
      isDisabled: true,
    };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    expect(timeSlot.classList.contains('lunch-break')).toBe(true);
    expect(timeSlot.classList.contains('disabled')).toBe(true);
  });

  it('should apply past date styles when date is in the past', () => {
    hostComponent.testData = {
      ...mockTimeSlotData,
      isPastDate: true,
      isClickable: false,
      isDisabled: true,
    };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    expect(timeSlot.classList.contains('past-date')).toBe(true);
    expect(timeSlot.classList.contains('disabled')).toBe(true);
  });

  it('should apply past time styles when time is in the past', () => {
    hostComponent.testData = {
      ...mockTimeSlotData,
      isPastTime: true,
      isClickable: false,
      isDisabled: true,
    };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    expect(timeSlot.classList.contains('past-time')).toBe(true);
    expect(timeSlot.classList.contains('disabled')).toBe(true);
  });

  it('should display correct tooltip', () => {
    const compiled = hostFixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    expect(timeSlot.getAttribute('title')).toBe('Available slot');
  });

  it('should emit click event when slot is clickable', () => {
    const compiled = hostFixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    spyOn(component.clicked, 'emit');

    timeSlot.click();

    expect(component.clicked.emit).toHaveBeenCalledWith({
      date: mockTimeSlotData.date,
      time: mockTimeSlotData.time,
    });
  });

  it('should not emit click event when slot is not clickable', () => {
    hostComponent.testData = { ...mockTimeSlotData, isClickable: false };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    const timeSlot = compiled.querySelector('.time-slot');

    spyOn(component.clicked, 'emit');

    timeSlot.click();

    expect(component.clicked.emit).not.toHaveBeenCalled();
  });

  it('should have correct CSS classes', () => {
    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.time-slot')).toBeTruthy();
  });
});
