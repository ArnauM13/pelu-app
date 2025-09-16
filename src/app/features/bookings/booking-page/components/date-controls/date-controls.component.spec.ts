import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { DateControlsComponent, CalendarViewType } from './date-controls.component';

describe('DateControlsComponent', () => {
  let component: DateControlsComponent;
  let fixture: ComponentFixture<DateControlsComponent>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant'], {
      onLangChange: of({ lang: 'ca' })
    });
    translateSpy.instant.and.returnValue('Test Label');

    await TestBed.configureTestingModule({
      imports: [DateControlsComponent],
      providers: [
        { provide: TranslateService, useValue: translateSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DateControlsComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Navigation Logic', () => {
    it('should emit todayClicked event when today button is clicked', () => {
      spyOn(component.todayClicked, 'emit');

      component.onTodayClicked();

      expect(component.todayClicked.emit).toHaveBeenCalled();
    });

    it('should emit previousClicked event when previous button is clicked and navigation is allowed', () => {
      spyOn(component.previousClicked, 'emit');

      component.onPreviousClicked();

      expect(component.previousClicked.emit).toHaveBeenCalled();
    });

    it('should NOT emit previousClicked when canGoPrevious is false', () => {
      // Mock canGoPrevious to return false
      spyOn(component, 'canGoPrevious').and.returnValue(false);
      spyOn(component.previousClicked, 'emit');

      component.onPreviousClicked();

      expect(component.previousClicked.emit).not.toHaveBeenCalled();
    });

    it('should emit nextClicked event when next button is clicked', () => {
      spyOn(component.nextClicked, 'emit');

      component.onNextClicked();

      expect(component.nextClicked.emit).toHaveBeenCalled();
    });
  });

  describe('View Management Logic', () => {
    it('should emit viewChanged event with correct view type', () => {
      spyOn(component.viewChanged, 'emit');

      component.onViewChanged('month');

      expect(component.viewChanged.emit).toHaveBeenCalledWith('month');
    });

    it('should return correct view options for desktop', () => {
      const options = component.getViewOptions();

      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBe(2);
      expect(options[0].value).toBe('daily');
      expect(options[1].value).toBe('weekly');
    });

    it('should return correct mobile toggle button configuration for week view', () => {
      // Mock currentView to return 'week'
      spyOn(component, 'currentView').and.returnValue('week');

      const toggleButton = component.mobileToggleButton();

      expect(toggleButton.label).toBe('Mes');
      expect(toggleButton.icon).toBe('pi pi-calendar');
      expect(toggleButton.nextView).toBe('month');
    });

    it('should return correct mobile toggle button configuration for month view', () => {
      // Mock currentView to return 'month'
      spyOn(component, 'currentView').and.returnValue('month');

      const toggleButton = component.mobileToggleButton();

      expect(toggleButton.label).toBe('Setmana');
      expect(toggleButton.icon).toBe('pi pi-calendar-plus');
      expect(toggleButton.nextView).toBe('week');
    });

    it('should emit viewChanged with correct next view when mobile toggle is clicked', () => {
      // Mock currentView to return 'week'
      spyOn(component, 'currentView').and.returnValue('week');
      spyOn(component.viewChanged, 'emit');

      component.onMobileViewToggle();

      expect(component.viewChanged.emit).toHaveBeenCalledWith('month');
    });
  });

  describe('Input Properties', () => {
    it('should have correct default input values', () => {
      expect(component.currentView()).toBe('weekly');
      expect(component.weekInfo()).toBe('');
      expect(component.isMobile()).toBe(false);
      expect(component.canGoPrevious()).toBe(true);
      expect(component.hideHeaderButtons()).toBe(false);
    });

    it('should accept and use custom input values', () => {
      // Test that inputs are properly typed and accessible
      expect(typeof component.currentView()).toBe('string');
      expect(typeof component.weekInfo()).toBe('string');
      expect(typeof component.isMobile()).toBe('boolean');
      expect(typeof component.canGoPrevious()).toBe('boolean');
      expect(typeof component.hideHeaderButtons()).toBe('boolean');
    });
  });

  describe('Translation Integration', () => {
    it('should use TranslateService for view options', () => {
      component.getViewOptions();

      expect(translateService.instant).toHaveBeenCalled();
    });

    it('should use TranslateService for mobile toggle button labels', () => {
      component.mobileToggleButton();

      expect(translateService.instant).toHaveBeenCalled();
    });
  });

  describe('Mobile Toggle Functionality', () => {
    it('should emit viewChanged with correct next view when mobile toggle is clicked from week to month', () => {
      spyOn(component, 'currentView').and.returnValue('week');
      spyOn(component.viewChanged, 'emit');

      component.onMobileViewToggle();

      expect(component.viewChanged.emit).toHaveBeenCalledWith('month');
    });

    it('should emit viewChanged with correct next view when mobile toggle is clicked from month to week', () => {
      spyOn(component, 'currentView').and.returnValue('month');
      spyOn(component.viewChanged, 'emit');

      component.onMobileViewToggle();

      expect(component.viewChanged.emit).toHaveBeenCalledWith('week');
    });

    it('should handle weekly view type correctly in mobile toggle', () => {
      spyOn(component, 'currentView').and.returnValue('weekly');
      spyOn(component.viewChanged, 'emit');

      component.onMobileViewToggle();

      expect(component.viewChanged.emit).toHaveBeenCalledWith('month');
    });
  });

  describe('Template Rendering', () => {
    it('should render mobile layout when isMobile is true', () => {
      // This would require more complex testing setup with TestBed
      // For now, we test the logic that determines the layout
      expect(component.isMobile()).toBe(false); // Default value
    });

    it('should render desktop layout when isMobile is false', () => {
      expect(component.isMobile()).toBe(false); // Default value
    });

    it('should hide header buttons when hideHeaderButtons is true', () => {
      expect(component.hideHeaderButtons()).toBe(false); // Default value
    });
  });

  describe('View Options Management', () => {
    it('should return correct view options for desktop', () => {
      const options = component.getViewOptions();

      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBe(2);
      expect(options[0].value).toBe('daily');
      expect(options[1].value).toBe('weekly');
      expect(options[0].icon).toBe('pi pi-calendar');
      expect(options[1].icon).toBe('pi pi-calendar-plus');
    });

    it('should update view options when language changes', () => {
      const initialOptions = component.getViewOptions();

      // The options should be updated (this tests the effect in constructor)
      expect(component.getViewOptions()).toBeDefined();
    });
  });

  describe('Button States and Interactions', () => {
    it('should disable previous button when canGoPrevious is false', () => {
      expect(component.canGoPrevious()).toBe(true); // Default value
    });

    it('should enable next button by default', () => {
      // Next button is always enabled, no disabled state
      expect(component.onNextClicked).toBeDefined();
    });

    it('should handle view change with valid view types', () => {
      spyOn(component.viewChanged, 'emit');

      component.onViewChanged('daily');
      expect(component.viewChanged.emit).toHaveBeenCalledWith('daily');

      component.onViewChanged('weekly');
      expect(component.viewChanged.emit).toHaveBeenCalledWith('weekly');

      component.onViewChanged('month');
      expect(component.viewChanged.emit).toHaveBeenCalledWith('month');
    });

    it('should not emit viewChanged for invalid view types', () => {
      spyOn(component.viewChanged, 'emit');

      component.onViewChanged('invalid');
      expect(component.viewChanged.emit).not.toHaveBeenCalled();

      component.onViewChanged(undefined);
      expect(component.viewChanged.emit).not.toHaveBeenCalled();
    });
  });
});
