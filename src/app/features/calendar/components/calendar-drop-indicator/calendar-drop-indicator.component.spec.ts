import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarDropIndicatorComponent, DropIndicatorData } from './calendar-drop-indicator.component';

describe('CalendarDropIndicatorComponent', () => {
  let component: CalendarDropIndicatorComponent;
  let fixture: ComponentFixture<CalendarDropIndicatorComponent>;

  const mockDropIndicatorData: DropIndicatorData = {
    top: 150,
    height: 60,
    isValid: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarDropIndicatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarDropIndicatorComponent);
    component = fixture.componentInstance;
    TestBed.runInInjectionContext(() => {
      (component.data as any).set(mockDropIndicatorData);
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply correct positioning styles', () => {
    const compiled = fixture.nativeElement;
    const dropIndicator = compiled.querySelector('.drop-indicator');

    expect(dropIndicator.style.top).toBe('150px');
    expect(dropIndicator.style.height).toBe('60px');
  });

  it('should apply valid styles when drop is valid', () => {
    const compiled = fixture.nativeElement;
    const dropIndicator = compiled.querySelector('.drop-indicator');

    expect(dropIndicator.classList.contains('valid')).toBe(true);
    expect(dropIndicator.classList.contains('invalid')).toBe(false);
  });

  it('should apply invalid styles when drop is invalid', () => {
    const invalidData = { ...mockDropIndicatorData, isValid: false };
    TestBed.runInInjectionContext(() => {
      (component.data as any).set(invalidData);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const dropIndicator = compiled.querySelector('.drop-indicator');

    expect(dropIndicator.classList.contains('invalid')).toBe(true);
    expect(dropIndicator.classList.contains('valid')).toBe(false);
  });

  it('should handle different positioning', () => {
    const differentData = {
      ...mockDropIndicatorData,
      top: 300,
      height: 90
    };

    TestBed.runInInjectionContext(() => {
      (component.data as any).set(differentData);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const dropIndicator = compiled.querySelector('.drop-indicator');

    expect(dropIndicator.style.top).toBe('300px');
    expect(dropIndicator.style.height).toBe('90px');
  });

  it('should have correct CSS classes', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.drop-indicator')).toBeTruthy();
  });

  it('should be positioned absolutely', () => {
    const compiled = fixture.nativeElement;
    const dropIndicator = compiled.querySelector('.drop-indicator');

    const computedStyle = window.getComputedStyle(dropIndicator);
    expect(computedStyle.position).toBe('absolute');
  });

  it('should have pointer events disabled', () => {
    const compiled = fixture.nativeElement;
    const dropIndicator = compiled.querySelector('.drop-indicator');

    const computedStyle = window.getComputedStyle(dropIndicator);
    expect(computedStyle.pointerEvents).toBe('none');
  });

  it('should have high z-index', () => {
    const compiled = fixture.nativeElement;
    const dropIndicator = compiled.querySelector('.drop-indicator');

    const computedStyle = window.getComputedStyle(dropIndicator);
    expect(computedStyle.zIndex).toBe('15');
  });
});
