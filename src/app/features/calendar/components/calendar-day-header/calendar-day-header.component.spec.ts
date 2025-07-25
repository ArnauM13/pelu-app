import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CalendarDayHeaderComponent, DayHeaderData } from './calendar-day-header.component';

// Test host component to provide required inputs
@Component({
  template: ` <pelu-calendar-day-header [data]="testData"></pelu-calendar-day-header> `,
  imports: [CalendarDayHeaderComponent],
})
class TestHostComponent {
  testData: DayHeaderData = {
    date: new Date('2024-01-15'),
    dayName: 'Dilluns',
    dayDate: '15/01',
    isPast: false,
    isDisabled: false,
  };
}

describe('CalendarDayHeaderComponent', () => {
  let component: CalendarDayHeaderComponent;
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  const mockDayHeaderData: DayHeaderData = {
    date: new Date('2024-01-15'),
    dayName: 'Dilluns',
    dayDate: '15/01',
    isPast: false,
    isDisabled: false,
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

  it('should display day name and date', () => {
    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.day-name').textContent).toContain('Dilluns');
    expect(compiled.querySelector('.day-date').textContent).toContain('15/01');
  });

  it('should have correct CSS classes', () => {
    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.day-header')).toBeTruthy();
    expect(compiled.querySelector('.day-name')).toBeTruthy();
    expect(compiled.querySelector('.day-date')).toBeTruthy();
  });

  it('should apply past styles when date is in the past', () => {
    hostComponent.testData = { ...mockDayHeaderData, isPast: true };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    const dayHeader = compiled.querySelector('.day-header');
    expect(dayHeader.classList.contains('past')).toBe(true);
  });

  it('should apply disabled styles when day is disabled', () => {
    hostComponent.testData = { ...mockDayHeaderData, isDisabled: true };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    const dayHeader = compiled.querySelector('.day-header');
    expect(dayHeader.classList.contains('disabled')).toBe(true);
  });

  it('should have proper component structure', () => {
    const compiled = hostFixture.nativeElement;
    expect(compiled.innerHTML).toContain('day-header');
  });

  it('should have component metadata', () => {
    expect(CalendarDayHeaderComponent.prototype.constructor).toBeDefined();
  });
});
