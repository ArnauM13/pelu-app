import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarDayHeaderComponent, DayHeaderData } from './calendar-day-header.component';

describe('CalendarDayHeaderComponent', () => {
  let component: CalendarDayHeaderComponent;
  let fixture: ComponentFixture<CalendarDayHeaderComponent>;

  const mockDayHeaderData: DayHeaderData = {
    date: new Date('2024-01-15'),
    dayName: 'Dilluns',
    dayDate: '15/01',
    isPast: false,
    isDisabled: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarDayHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarDayHeaderComponent);
    component = fixture.componentInstance;
    TestBed.runInInjectionContext(() => {
      (component.data as any).set(mockDayHeaderData);
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display day name and date', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('.day-name').textContent).toContain('Dilluns');
    expect(compiled.querySelector('.day-date').textContent).toContain('15/01');
  });

  it('should apply past styles when date is in the past', () => {
    const pastData = { ...mockDayHeaderData, isPast: true };
    TestBed.runInInjectionContext(() => {
      (component.data as any).set(pastData);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const dayHeader = compiled.querySelector('.day-header');

    expect(dayHeader.classList.contains('past')).toBe(true);
  });

  it('should apply disabled styles when day is disabled', () => {
    const disabledData = { ...mockDayHeaderData, isDisabled: true };
    TestBed.runInInjectionContext(() => {
      (component.data as any).set(disabledData);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const dayHeader = compiled.querySelector('.day-header');

    expect(dayHeader.classList.contains('disabled')).toBe(true);
  });

  it('should not apply past or disabled styles for regular day', () => {
    const compiled = fixture.nativeElement;
    const dayHeader = compiled.querySelector('.day-header');

    expect(dayHeader.classList.contains('past')).toBe(false);
    expect(dayHeader.classList.contains('disabled')).toBe(false);
  });

  it('should have correct CSS classes', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('.day-header')).toBeTruthy();
    expect(compiled.querySelector('.day-name')).toBeTruthy();
    expect(compiled.querySelector('.day-date')).toBeTruthy();
  });

  it('should handle different day names and dates', () => {
    const differentData = {
      ...mockDayHeaderData,
      dayName: 'Dimarts',
      dayDate: '16/01'
    };

    TestBed.runInInjectionContext(() => {
      (component.data as any).set(differentData);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('.day-name').textContent).toContain('Dimarts');
    expect(compiled.querySelector('.day-date').textContent).toContain('16/01');
  });
});
