import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import {
  CalendarDropIndicatorComponent,
  DropIndicatorData,
} from './calendar-drop-indicator.component';

// Test host component to provide required inputs
@Component({
  template: ` <pelu-calendar-drop-indicator [data]="testData"></pelu-calendar-drop-indicator> `,
  imports: [CalendarDropIndicatorComponent],
})
class TestHostComponent {
  testData: DropIndicatorData = {
    top: 150,
    height: 60,
    isValid: true,
  };
}

describe('CalendarDropIndicatorComponent', () => {
  let component: CalendarDropIndicatorComponent;
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  const mockDropIndicatorData: DropIndicatorData = {
    top: 150,
    height: 60,
    isValid: true,
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

  it('should apply correct positioning styles', () => {
    const compiled = hostFixture.nativeElement;
    const dropIndicator = compiled.querySelector('.drop-indicator');

    expect(dropIndicator.style.top).toBe('150px');
    expect(dropIndicator.style.height).toBe('60px');
  });

  it('should apply valid styles when drop is valid', () => {
    const compiled = hostFixture.nativeElement;
    const dropIndicator = compiled.querySelector('.drop-indicator');

    expect(dropIndicator.classList.contains('valid')).toBe(true);
    expect(dropIndicator.classList.contains('invalid')).toBe(false);
  });

  it('should apply invalid styles when drop is invalid', () => {
    hostComponent.testData = { ...mockDropIndicatorData, isValid: false };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    const dropIndicator = compiled.querySelector('.drop-indicator');

    expect(dropIndicator.classList.contains('invalid')).toBe(true);
    expect(dropIndicator.classList.contains('valid')).toBe(false);
  });

  it('should handle different positioning', () => {
    hostComponent.testData = {
      ...mockDropIndicatorData,
      top: 300,
      height: 90,
    };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    const dropIndicator = compiled.querySelector('.drop-indicator');

    expect(dropIndicator.style.top).toBe('300px');
    expect(dropIndicator.style.height).toBe('90px');
  });

  it('should have correct CSS classes', () => {
    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.drop-indicator')).toBeTruthy();
  });

  it('should be positioned absolutely', () => {
    const compiled = hostFixture.nativeElement;
    const dropIndicator = compiled.querySelector('.drop-indicator');

    const computedStyle = window.getComputedStyle(dropIndicator);
    expect(computedStyle.position).toBe('absolute');
  });

  it('should have pointer events disabled', () => {
    const compiled = hostFixture.nativeElement;
    const dropIndicator = compiled.querySelector('.drop-indicator');

    const computedStyle = window.getComputedStyle(dropIndicator);
    expect(computedStyle.pointerEvents).toBe('none');
  });

  it('should have high z-index', () => {
    const compiled = hostFixture.nativeElement;
    const dropIndicator = compiled.querySelector('.drop-indicator');

    const computedStyle = window.getComputedStyle(dropIndicator);
    expect(computedStyle.zIndex).toBe('15');
  });
});
