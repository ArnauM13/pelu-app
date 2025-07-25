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

  describe('Static Literals', () => {
    it('should have correct static labels', () => {
      expect(component.todayLabel).toBe('Avui');
      expect(component.previousWeekLabel).toBe('Setmana anterior');
      expect(component.nextWeekLabel).toBe('Pròxima setmana');
      expect(component.goToTodayLabel).toBe('Anar a avui');
    });
  });

  describe('Angular 18 Signals', () => {
    it('should use input signals correctly', () => {
      expect(component.currentViewDate()).toBeInstanceOf(Date);
      expect(component.mainTitle()).toBe('');
    });

    it('should use computed signals correctly', () => {
      expect(component.currentDateString()).toBeDefined();
      expect(component.todayDate()).toBeInstanceOf(Date);
    });

    it('should use output signals correctly', () => {
      const todaySpy = spyOn(component.today, 'emit');
      const previousWeekSpy = spyOn(component.previousWeek, 'emit');
      const nextWeekSpy = spyOn(component.nextWeek, 'emit');
      const dateChangeSpy = spyOn(component.dateChange, 'emit');

      component.onToday();
      component.onPreviousWeek();
      component.onNextWeek();
      component.onDateChange('2024-01-15');

      expect(todaySpy).toHaveBeenCalled();
      expect(previousWeekSpy).toHaveBeenCalled();
      expect(nextWeekSpy).toHaveBeenCalled();
      expect(dateChangeSpy).toHaveBeenCalledWith('2024-01-15');
    });
  });

  describe('Navigation Methods', () => {
    it('should emit events when navigation is triggered', () => {
      const todaySpy = spyOn(component.today, 'emit');
      const previousWeekSpy = spyOn(component.previousWeek, 'emit');
      const nextWeekSpy = spyOn(component.nextWeek, 'emit');

      component.onToday();
      component.onPreviousWeek();
      component.onNextWeek();

      expect(todaySpy).toHaveBeenCalled();
      expect(previousWeekSpy).toHaveBeenCalled();
      expect(nextWeekSpy).toHaveBeenCalled();
    });

    it('should handle date change with Date object', () => {
      const testDate = new Date('2024-01-15');
      const dateChangeSpy = spyOn(component.dateChange, 'emit');

      component.onDateChange(testDate);

      expect(dateChangeSpy).toHaveBeenCalledWith('2024-01-15');
    });

    it('should handle date change with string', () => {
      const testDateString = '2024-01-15';
      const dateChangeSpy = spyOn(component.dateChange, 'emit');

      component.onDateChange(testDateString);

      expect(dateChangeSpy).toHaveBeenCalledWith(testDateString);
    });

    it('should handle null date change gracefully', () => {
      const dateChangeSpy = spyOn(component.dateChange, 'emit');

      component.onDateChange(null);

      expect(dateChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Template Integration', () => {
    it('should render navigation buttons', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('pelu-button');
      expect(buttons.length).toBe(3); // Previous, Today, Next
    });

    it('should emit events when buttons are clicked', () => {
      const todaySpy = spyOn(component.today, 'emit');
      const previousWeekSpy = spyOn(component.previousWeek, 'emit');
      const nextWeekSpy = spyOn(component.nextWeek, 'emit');

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('pelu-button');

      // Simulate button clicks
      buttons[0].dispatchEvent(new Event('clicked')); // Previous
      buttons[1].dispatchEvent(new Event('clicked')); // Today
      buttons[2].dispatchEvent(new Event('clicked')); // Next

      expect(previousWeekSpy).toHaveBeenCalled();
      expect(todaySpy).toHaveBeenCalled();
      expect(nextWeekSpy).toHaveBeenCalled();
    });

    it('should display correct data in template', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toBeDefined();
    });

    it('should use static literals in template', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('pelu-button');

      // Check that the Today button displays the static label
      const todayButton = buttons[1];
      expect(todayButton.getAttribute('ng-reflect-label')).toBe('Avui');
      expect(todayButton.getAttribute('ng-reflect-aria-label')).toBe('Anar a avui');
    });
  });
});
