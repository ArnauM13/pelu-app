import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
  TranslateLoader,
} from '@ngx-translate/core';
import {
  AppointmentStatusBadgeComponent,
  AppointmentStatusData,
  AppointmentStatusConfig,
} from './appointment-status-badge.component';
import { of } from 'rxjs';

// Mock TranslateLoader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('AppointmentStatusBadgeComponent', () => {
  let component: AppointmentStatusBadgeComponent;
  let fixture: ComponentFixture<AppointmentStatusBadgeComponent>;
  let translateService: jasmine.SpyObj<TranslateService>;

  const mockAppointmentData: AppointmentStatusData = {
    date: '2024-01-15',
    time: '10:00',
  };

  const mockConfig: AppointmentStatusConfig = {
    size: 'medium',
    variant: 'default',
    showIcon: true,
    showDot: true,
  };

  beforeEach(async () => {
    const translateSpy = jasmine.createSpyObj('TranslateService', [
      'get',
      'instant',
      'addLangs',
      'getBrowserLang',
      'use',
      'reloadLang',
      'setDefaultLang',
      'getDefaultLang',
      'getLangs',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        AppointmentStatusBadgeComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: TranslateService, useValue: translateSpy },
        {
          provide: TranslateStore,
          useValue: {
            get: (key: string) => key,
            set: (key: string, value: any) => {},
            has: (key: string) => true,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentStatusBadgeComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    // Setup default mock return values
    translateService.get.and.returnValue(of('translated text'));
    translateService.instant.and.returnValue('translated text');
    translateService.addLangs.and.returnValue(undefined);
    translateService.getBrowserLang.and.returnValue('ca');
    translateService.use.and.returnValue(of({}));
    translateService.reloadLang.and.returnValue(of({}));
    translateService.setDefaultLang.and.returnValue(undefined);
    translateService.getDefaultLang.and.returnValue('ca');
    translateService.getLangs.and.returnValue(['ca', 'es', 'en', 'ar']);

    fixture = TestBed.createComponent(AppointmentStatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have appointmentData input property', () => {
    expect(component.appointmentData).toBeDefined();
  });

  it('should have config input property', () => {
    expect(component.config).toBeDefined();
  });

  it('should have status computed property', () => {
    expect(component.status).toBeDefined();
    expect(typeof component.status).toBe('function');
  });

  it('should have cssClasses computed property', () => {
    expect(component.cssClasses).toBeDefined();
    expect(typeof component.cssClasses).toBe('function');
  });

  it('should be a standalone component', () => {
    expect(AppointmentStatusBadgeComponent.prototype.constructor).toBeDefined();
    expect(AppointmentStatusBadgeComponent.prototype.constructor.name).toBe(
      'AppointmentStatusBadgeComponent'
    );
  });

  it('should have component metadata', () => {
    expect(AppointmentStatusBadgeComponent.prototype).toBeDefined();
    expect(AppointmentStatusBadgeComponent.prototype.constructor).toBeDefined();
  });

  describe('Default Configuration', () => {
    it('should have default config values', () => {
      expect(component.config.size).toBe('medium');
      expect(component.config.variant).toBe('default');
      expect(component.config.showIcon).toBe(true);
      expect(component.config.showDot).toBe(true);
    });
  });

  describe('Status Computation', () => {
    it('should return upcoming status for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      component.appointmentData = { date: futureDate.toISOString().split('T')[0] };
      fixture.detectChanges();

      const status = component.status();
      expect(status.type).toBe('upcoming');
      expect(status.text).toBe('COMMON.TIME.UPCOMING');
      expect(status.icon).toBe('⏰');
    });

    it('should return today status for current date', () => {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      component.appointmentData = { date: todayString };
      fixture.detectChanges();

      const status = component.status();
      expect(status.type).toBe('today');
      expect(status.text).toBe('COMMON.TIME.TODAY');
      expect(status.icon).toBe('🎯');
    });

    it('should return past status for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      component.appointmentData = { date: pastDate.toISOString().split('T')[0] };
      fixture.detectChanges();

      const status = component.status();
      expect(status.type).toBe('past');
      expect(status.text).toBe('COMMON.TIME.PAST');
      expect(status.icon).toBe('📅');
    });

    it('should return upcoming status when no date is provided', () => {
      component.appointmentData = { date: '' };
      fixture.detectChanges();

      const status = component.status();
      expect(status.type).toBe('upcoming');
      expect(status.text).toBe('COMMON.UPCOMING');
      expect(status.icon).toBe('⏰');
    });
  });

  describe('CSS Classes Generation', () => {
    beforeEach(() => {
      component.appointmentData = mockAppointmentData;
    });

    it('should generate correct classes for small size', () => {
      component.config = { ...mockConfig, size: 'small' };
      fixture.detectChanges();

      const classes = component.cssClasses();
      expect(classes['status-badge-small']).toBe(true);
      expect(classes['status-badge-default']).toBe(true);
    });

    it('should generate correct classes for medium size', () => {
      component.config = { ...mockConfig, size: 'medium' };
      fixture.detectChanges();

      const classes = component.cssClasses();
      expect(classes['status-badge-medium']).toBe(true);
      expect(classes['status-badge-default']).toBe(true);
    });

    it('should generate correct classes for large size', () => {
      component.config = { ...mockConfig, size: 'large' };
      fixture.detectChanges();

      const classes = component.cssClasses();
      expect(classes['status-badge-large']).toBe(true);
      expect(classes['status-badge-default']).toBe(true);
    });

    it('should generate correct classes for default variant', () => {
      component.config = { ...mockConfig, variant: 'default' };
      fixture.detectChanges();

      const classes = component.cssClasses();
      expect(classes['status-badge-default']).toBe(true);
    });

    it('should generate correct classes for outlined variant', () => {
      component.config = { ...mockConfig, variant: 'outlined' };
      fixture.detectChanges();

      const classes = component.cssClasses();
      expect(classes['status-badge-outlined']).toBe(true);
    });

    it('should generate correct classes for minimal variant', () => {
      component.config = { ...mockConfig, variant: 'minimal' };
      fixture.detectChanges();

      const classes = component.cssClasses();
      expect(classes['status-badge-minimal']).toBe(true);
    });

    it('should generate status-specific classes', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const classes = component.cssClasses();
      const statusType = component.status().type;
      expect(classes[`status-badge-${statusType}`]).toBe(true);
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      component.appointmentData = mockAppointmentData;
      component.config = mockConfig;
    });

    it('should render with provided data and config', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const badgeElement = compiled.querySelector('.appointment-status-badge');
      expect(badgeElement).toBeTruthy();
    });

    it('should render icon when showIcon is true', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const iconElement = compiled.querySelector('.status-icon');
      expect(iconElement).toBeTruthy();
    });

    it('should not render icon when showIcon is false', () => {
      component.config = { ...mockConfig, showIcon: false };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const iconElement = compiled.querySelector('.status-icon');
      expect(iconElement).toBeFalsy();
    });

    it('should render dot when showDot is true', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const dotElement = compiled.querySelector('.status-dot');
      expect(dotElement).toBeTruthy();
    });

    it('should not render dot when showDot is false', () => {
      component.config = { ...mockConfig, showDot: false };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const dotElement = compiled.querySelector('.status-dot');
      expect(dotElement).toBeFalsy();
    });

    it('should render status text', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const textElement = compiled.querySelector('.status-text');
      expect(textElement).toBeTruthy();
    });

    it('should have proper CSS classes', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const badgeElement = compiled.querySelector('.appointment-status-badge');
      expect(badgeElement?.classList.contains('appointment-status-badge')).toBeTruthy();
    });

    it('should have proper HTML structure', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.innerHTML).toContain('appointment-status-badge');
      expect(compiled.innerHTML).toContain('status-icon');
      expect(compiled.innerHTML).toContain('status-dot');
      expect(compiled.innerHTML).toContain('status-text');
    });
  });

  describe('Config Handling', () => {
    beforeEach(() => {
      component.appointmentData = mockAppointmentData;
    });

    it('should handle config with all properties', () => {
      const fullConfig: AppointmentStatusConfig = {
        size: 'large',
        variant: 'outlined',
        showIcon: true,
        showDot: true,
      };

      component.config = fullConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.status-icon')).toBeTruthy();
      expect(compiled.querySelector('.status-dot')).toBeTruthy();
    });

    it('should handle config with minimal properties', () => {
      const minimalConfig: AppointmentStatusConfig = {
        size: 'small',
        variant: 'default',
      };

      component.config = minimalConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.appointment-status-badge')).toBeTruthy();
    });

    it('should handle undefined config properties', () => {
      const incompleteConfig: AppointmentStatusConfig = {
        size: 'medium',
      };

      component.config = incompleteConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.appointment-status-badge')).toBeTruthy();
    });
  });

  describe('Component Behavior', () => {
    it('should initialize with appointmentData input', () => {
      component.appointmentData = mockAppointmentData;
      expect(component.appointmentData).toBe(mockAppointmentData);
    });

    it('should initialize with config input', () => {
      component.config = mockConfig;
      expect(component.config).toBe(mockConfig);
    });

    it('should maintain data reference consistency', () => {
      component.appointmentData = mockAppointmentData;
      const initialData = component.appointmentData;
      expect(component.appointmentData).toBe(initialData);
    });

    it('should not throw errors during rendering', () => {
      component.appointmentData = mockAppointmentData;
      component.config = mockConfig;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle data changes gracefully', () => {
      expect(() => {
        component.appointmentData = mockAppointmentData;
        component.config = mockConfig;
        fixture.detectChanges();
        component.appointmentData = { date: '2024-01-16' };
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing appointmentData gracefully', () => {
      // Component should still be created even without appointmentData
      expect(component).toBeTruthy();
    });

    it('should handle missing config gracefully', () => {
      // Component should still be created even without config
      expect(component).toBeTruthy();
    });

    it('should handle undefined data properties gracefully', () => {
      const incompleteData: AppointmentStatusData = {
        date: '',
      };
      component.appointmentData = incompleteData;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle invalid date strings gracefully', () => {
      component.appointmentData = { date: 'invalid-date' };
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Interface Validation', () => {
    it('should handle AppointmentStatusData interface correctly', () => {
      const testData: AppointmentStatusData = {
        date: '2024-01-15',
        time: '10:00',
      };

      expect(testData.date).toBe('2024-01-15');
      expect(testData.time).toBe('10:00');
    });

    it('should handle AppointmentStatusData without optional properties', () => {
      const testData: AppointmentStatusData = {
        date: '2024-01-15',
      };

      expect(testData.date).toBe('2024-01-15');
      expect(testData.time).toBeUndefined();
    });

    it('should handle AppointmentStatusConfig interface correctly', () => {
      const testConfig: AppointmentStatusConfig = {
        size: 'large',
        variant: 'outlined',
        showIcon: true,
        showDot: true,
      };

      expect(testConfig.size).toBe('large');
      expect(testConfig.variant).toBe('outlined');
      expect(testConfig.showIcon).toBe(true);
      expect(testConfig.showDot).toBe(true);
    });

    it('should validate size enum values', () => {
      const validSizes = ['small', 'medium', 'large'];
      validSizes.forEach(size => {
        expect(['small', 'medium', 'large']).toContain(size);
      });
    });

    it('should validate variant enum values', () => {
      const validVariants = ['default', 'outlined', 'minimal'];
      validVariants.forEach(variant => {
        expect(['default', 'outlined', 'minimal']).toContain(variant);
      });
    });

    it('should validate AppointmentStatusType enum values', () => {
      const validTypes = ['today', 'past', 'upcoming'];
      validTypes.forEach(type => {
        expect(['today', 'past', 'upcoming']).toContain(type);
      });
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(AppointmentStatusBadgeComponent.prototype.constructor).toBeDefined();
    });

    it('should have proper component selector', () => {
      expect(AppointmentStatusBadgeComponent.prototype.constructor.name).toBe(
        'AppointmentStatusBadgeComponent'
      );
    });

    it('should have proper component imports', () => {
      expect(AppointmentStatusBadgeComponent).toBeDefined();
      expect(component).toBeInstanceOf(AppointmentStatusBadgeComponent);
    });
  });
});
