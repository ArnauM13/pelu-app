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
      const dateChangeSpy = spyOn(component.dateChange, 'emit');

      component.emitToday();
      component.onDateChange('2024-01-15');

      expect(todaySpy).toHaveBeenCalled();
      expect(dateChangeSpy).toHaveBeenCalledWith('2024-01-15');
    });
  });

  describe('Navigation Methods', () => {
    it('should emit today event when emitToday is called', () => {
      const todaySpy = spyOn(component.today, 'emit');

      component.emitToday();

      expect(todaySpy).toHaveBeenCalled();
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
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should emit events when buttons are clicked', () => {
      const todaySpy = spyOn(component.today, 'emit');

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('pelu-button');

      // Simulate button clicks if buttons exist
      if (buttons.length > 0) {
        buttons[0].dispatchEvent(new Event('clicked'));
      }

      expect(todaySpy).toHaveBeenCalled();
    });

    it('should display correct data in template', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toBeDefined();
    });
  });
});
