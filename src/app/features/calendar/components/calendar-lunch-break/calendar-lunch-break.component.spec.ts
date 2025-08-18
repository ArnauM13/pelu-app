import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CalendarLunchBreakComponent, LunchBreakData } from './calendar-lunch-break.component';

// Test host component to provide required inputs
@Component({
  template: ` <pelu-calendar-lunch-break [data]="testData"></pelu-calendar-lunch-break> `,
  imports: [CalendarLunchBreakComponent],
})
class TestHostComponent {
  testData: LunchBreakData = {
    top: 120,
    height: 60,
    timeRange: {
      start: '12:00',
      end: '13:00',
    },
  };
}

describe('CalendarLunchBreakComponent', () => {
  let component: CalendarLunchBreakComponent;
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  const mockLunchBreakData: LunchBreakData = {
    top: 120,
    height: 60,
    timeRange: {
      start: '12:00',
      end: '13:00',
    },
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

  it('should display lunch break content', () => {
    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.lunch-break-content')).toBeTruthy();
    expect(compiled.querySelector('.lunch-break-content i')).toBeTruthy();
  });

  it('should have coffee icon', () => {
    const compiled = hostFixture.nativeElement;
    const icon = compiled.querySelector('.lunch-break-content i');

    expect(icon).toBeTruthy();
    expect(icon.classList.contains('pi')).toBe(true);
    expect(icon.classList.contains('pi-coffee')).toBe(true);
  });

  it('should apply correct positioning styles', () => {
    const compiled = hostFixture.nativeElement;
    const overlay = compiled.querySelector('.lunch-break-overlay');

    expect(overlay.style.top).toBe('120px');
    expect(overlay.style.height).toBe('60px');
  });

  it('should display correct tooltip with time range', () => {
    const compiled = hostFixture.nativeElement;
    const overlay = compiled.querySelector('.lunch-break-overlay');

    expect(overlay.getAttribute('title')).toBe('Migdia: 12:00 - 13:00');
  });

  it('should handle different time ranges', () => {
    hostComponent.testData = {
      ...mockLunchBreakData,
      timeRange: {
        start: '13:00',
        end: '14:00',
      },
    };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    const overlay = compiled.querySelector('.lunch-break-overlay');

    expect(overlay.getAttribute('title')).toBe('Migdia: 13:00 - 14:00');
  });

  it('should handle different positioning', () => {
    hostComponent.testData = {
      ...mockLunchBreakData,
      top: 240,
      height: 90,
    };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    const overlay = compiled.querySelector('.lunch-break-overlay');

    expect(overlay.style.top).toBe('240px');
    expect(overlay.style.height).toBe('90px');
  });

  it('should have correct CSS classes', () => {
    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.lunch-break-overlay')).toBeTruthy();
    expect(compiled.querySelector('.lunch-break-content')).toBeTruthy();
  });

  it('should be positioned absolutely', () => {
    const compiled = hostFixture.nativeElement;
    const overlay = compiled.querySelector('.lunch-break-overlay');

    const computedStyle = window.getComputedStyle(overlay);
    expect(computedStyle.position).toBe('absolute');
  });
});
