import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarHeaderComponent } from './calendar-header.component';

describe('CalendarHeaderComponent', () => {
  let component: CalendarHeaderComponent;
  let fixture: ComponentFixture<CalendarHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.viewDateInfo).toBe('');
    expect(component.businessDaysInfo).toBe('');
    expect(component.mainTitle).toBe('');
    expect(component.canNavigateToPreviousWeek).toBe(true);
    expect(component.currentViewDate).toBeInstanceOf(Date);
  });

  it('should emit today event', () => {
    spyOn(component.today, 'emit');
    component.onToday();
    expect(component.today.emit).toHaveBeenCalled();
  });

  it('should emit previousWeek event', () => {
    spyOn(component.previousWeek, 'emit');
    component.onPreviousWeek();
    expect(component.previousWeek.emit).toHaveBeenCalled();
  });

  it('should emit nextWeek event', () => {
    spyOn(component.nextWeek, 'emit');
    component.onNextWeek();
    expect(component.nextWeek.emit).toHaveBeenCalled();
  });

  it('should emit dateChange event', () => {
    spyOn(component.dateChange, 'emit');
    const mockDate = '2024-01-15';
    component.onDateChange(mockDate);
    expect(component.dateChange.emit).toHaveBeenCalledWith('2024-01-15');
  });

  it('should format current date string correctly', () => {
    component.currentViewDate = new Date('2024-01-15');
    expect(component.currentDateString).toBe('2024-01-15');
  });

  it('should format today string correctly', () => {
    const today = new Date();
    const expected = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    expect(component.todayString).toBe(expected);
  });

  it('should not emit dateChange when value is empty', () => {
    spyOn(component.dateChange, 'emit');
    const mockDate = '';
    component.onDateChange(mockDate);
    expect(component.dateChange.emit).not.toHaveBeenCalled();
  });
});
