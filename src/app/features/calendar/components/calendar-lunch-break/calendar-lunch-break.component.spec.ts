import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarLunchBreakComponent, LunchBreakData } from './calendar-lunch-break.component';

describe('CalendarLunchBreakComponent', () => {
  let component: CalendarLunchBreakComponent;
  let fixture: ComponentFixture<CalendarLunchBreakComponent>;

  const mockLunchBreakData: LunchBreakData = {
    top: 120,
    height: 60,
    timeRange: {
      start: '12:00',
      end: '13:00'
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarLunchBreakComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarLunchBreakComponent);
    component = fixture.componentInstance;
    TestBed.runInInjectionContext(() => {
      (component.data as any).set(mockLunchBreakData);
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display lunch break content', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('.lunch-break-content')).toBeTruthy();
    expect(compiled.querySelector('.lunch-break-content span').textContent).toContain('Migdia');
  });

  it('should have coffee icon', () => {
    const compiled = fixture.nativeElement;
    const icon = compiled.querySelector('.lunch-break-content i');

    expect(icon).toBeTruthy();
    expect(icon.classList.contains('pi')).toBe(true);
    expect(icon.classList.contains('pi-coffee')).toBe(true);
  });

  it('should apply correct positioning styles', () => {
    const compiled = fixture.nativeElement;
    const overlay = compiled.querySelector('.lunch-break-overlay');

    expect(overlay.style.top).toBe('120px');
    expect(overlay.style.height).toBe('60px');
  });

  it('should display correct tooltip with time range', () => {
    const compiled = fixture.nativeElement;
    const overlay = compiled.querySelector('.lunch-break-overlay');

    expect(overlay.getAttribute('title')).toBe('Migdia: 12:00 - 13:00');
  });

  it('should handle different time ranges', () => {
    const differentData = {
      ...mockLunchBreakData,
      timeRange: {
        start: '13:00',
        end: '14:00'
      }
    };

    TestBed.runInInjectionContext(() => {
      (component.data as any).set(differentData);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const overlay = compiled.querySelector('.lunch-break-overlay');

    expect(overlay.getAttribute('title')).toBe('Migdia: 13:00 - 14:00');
  });

  it('should handle different positioning', () => {
    const differentData = {
      ...mockLunchBreakData,
      top: 240,
      height: 90
    };

    TestBed.runInInjectionContext(() => {
      (component.data as any).set(differentData);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const overlay = compiled.querySelector('.lunch-break-overlay');

    expect(overlay.style.top).toBe('240px');
    expect(overlay.style.height).toBe('90px');
  });

  it('should have correct CSS classes', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('.lunch-break-overlay')).toBeTruthy();
    expect(compiled.querySelector('.lunch-break-content')).toBeTruthy();
  });

  it('should be positioned absolutely', () => {
    const compiled = fixture.nativeElement;
    const overlay = compiled.querySelector('.lunch-break-overlay');

    const computedStyle = window.getComputedStyle(overlay);
    expect(computedStyle.position).toBe('absolute');
  });
});
