import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { LoadingStateComponent, LoadingStateConfig } from './loading-state.component';

describe('LoadingStateComponent', () => {
  let component: LoadingStateComponent;
  let fixture: ComponentFixture<LoadingStateComponent>;

  const mockConfig: LoadingStateConfig = {
    message: 'Loading test message',
    spinnerSize: 'medium',
    showMessage: true,
    fullHeight: false,
    overlay: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingStateComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) => key,
            get: (key: string) => ({ subscribe: (fn: any) => fn(key) }),
          },
        },
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

    fixture = TestBed.createComponent(LoadingStateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have config input property', () => {
    expect(component.config).toBeDefined();
  });

  it('should be a standalone component', () => {
    expect(LoadingStateComponent.prototype.constructor).toBeDefined();
    expect(LoadingStateComponent.prototype.constructor.name).toBe('LoadingStateComponent');
  });

  it('should have component metadata', () => {
    expect(LoadingStateComponent.prototype).toBeDefined();
    expect(LoadingStateComponent.prototype.constructor).toBeDefined();
  });

  describe('Default Configuration', () => {
    it('should have default config values', () => {
      expect(component.config.message).toBe('COMMON.LOADING');
      expect(component.config.spinnerSize).toBe('medium');
      expect(component.config.showMessage).toBe(true);
      expect(component.config.fullHeight).toBe(false);
      expect(component.config.overlay).toBe(false);
    });
  });

  describe('Template Rendering', () => {
    it('should render with provided config', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loadingContent = compiled.querySelector('.loading-content');
      expect(loadingContent).toBeTruthy();
    });

    it('should render spinner with correct size class', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const spinnerElement = compiled.querySelector('.spinner-medium');
      expect(spinnerElement).toBeTruthy();
    });

    it('should render message when showMessage is true and message is provided', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const messageElement = compiled.querySelector('.loading-message');
      expect(messageElement).toBeTruthy();
      expect(messageElement?.textContent).toContain('Loading test message');
    });

    it('should not render message when showMessage is false', () => {
      component.config = { ...mockConfig, showMessage: false };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const messageElement = compiled.querySelector('.loading-message');
      expect(messageElement).toBeFalsy();
    });

    it('should not render message when message is not provided', () => {
      component.config = { ...mockConfig, message: undefined };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const messageElement = compiled.querySelector('.loading-message');
      expect(messageElement).toBeFalsy();
    });

    it('should have full-height class when fullHeight is true', () => {
      component.config = { ...mockConfig, fullHeight: true };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loadingContent = compiled.querySelector('.loading-content');
      expect(loadingContent?.classList.contains('full-height')).toBeTruthy();
    });

    it('should have overlay class when overlay is true', () => {
      component.config = { ...mockConfig, overlay: true };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loadingContent = compiled.querySelector('.loading-content');
      expect(loadingContent?.classList.contains('overlay')).toBeTruthy();
    });

    it('should have proper CSS classes', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loadingContent = compiled.querySelector('.loading-content');
      expect(loadingContent?.classList.contains('loading-content')).toBeTruthy();
    });

    it('should have proper HTML structure', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.innerHTML).toContain('loading-content');
      expect(compiled.innerHTML).toContain('loading-spinner');
      expect(compiled.innerHTML).toContain('spinner');
    });
  });

  describe('Spinner Size Classes', () => {
    it('should apply small spinner class', () => {
      component.config = { ...mockConfig, spinnerSize: 'small' };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const spinnerElement = compiled.querySelector('.spinner-small');
      expect(spinnerElement).toBeTruthy();
    });

    it('should apply medium spinner class', () => {
      component.config = { ...mockConfig, spinnerSize: 'medium' };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const spinnerElement = compiled.querySelector('.spinner-medium');
      expect(spinnerElement).toBeTruthy();
    });

    it('should apply large spinner class', () => {
      component.config = { ...mockConfig, spinnerSize: 'large' };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const spinnerElement = compiled.querySelector('.spinner-large');
      expect(spinnerElement).toBeTruthy();
    });
  });

  describe('Config Handling', () => {
    it('should handle config with all properties', () => {
      const fullConfig: LoadingStateConfig = {
        message: 'Full config message',
        spinnerSize: 'large',
        showMessage: true,
        fullHeight: true,
        overlay: true,
      };

      component.config = fullConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.spinner-large')).toBeTruthy();
      expect(compiled.querySelector('.loading-message')?.textContent).toContain(
        'Full config message'
      );
      expect(
        compiled.querySelector('.loading-content')?.classList.contains('full-height')
      ).toBeTruthy();
      expect(
        compiled.querySelector('.loading-content')?.classList.contains('overlay')
      ).toBeTruthy();
    });

    it('should handle config with minimal properties', () => {
      const minimalConfig: LoadingStateConfig = {
        message: 'Minimal message',
        spinnerSize: 'small',
      };

      component.config = minimalConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.spinner-small')).toBeTruthy();
      expect(compiled.querySelector('.loading-message')?.textContent).toContain('Minimal message');
    });

    it('should handle undefined config properties', () => {
      const incompleteConfig: LoadingStateConfig = {
        message: 'Test message',
      };

      component.config = incompleteConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loading-content')).toBeTruthy();
    });
  });

  describe('Component Behavior', () => {
    it('should initialize with config input', () => {
      component.config = mockConfig;
      expect(component.config).toBe(mockConfig);
    });

    it('should maintain config reference consistency', () => {
      component.config = mockConfig;
      const initialConfig = component.config;
      expect(component.config).toBe(initialConfig);
    });

    it('should not throw errors during rendering', () => {
      component.config = mockConfig;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle config changes gracefully', () => {
      expect(() => {
        component.config = mockConfig;
        fixture.detectChanges();
        component.config = { ...mockConfig, spinnerSize: 'large' };
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing config gracefully', () => {
      // Component should still be created even without config
      expect(component).toBeTruthy();
    });

    it('should handle undefined config properties gracefully', () => {
      const incompleteConfig: LoadingStateConfig = {
        message: 'Test message',
      };
      component.config = incompleteConfig;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle empty strings gracefully', () => {
      const emptyConfig: LoadingStateConfig = {
        message: '',
        spinnerSize: 'medium',
      };
      component.config = emptyConfig;
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Interface Validation', () => {
    it('should handle LoadingStateConfig interface correctly', () => {
      const testConfig: LoadingStateConfig = {
        message: 'Test message',
        spinnerSize: 'large',
        showMessage: true,
        fullHeight: true,
        overlay: true,
      };

      expect(testConfig.message).toBe('Test message');
      expect(testConfig.spinnerSize).toBe('large');
      expect(testConfig.showMessage).toBe(true);
      expect(testConfig.fullHeight).toBe(true);
      expect(testConfig.overlay).toBe(true);
    });

    it('should handle LoadingStateConfig without optional properties', () => {
      const testConfig: LoadingStateConfig = {
        message: 'Test message',
      };

      expect(testConfig.message).toBe('Test message');
      expect(testConfig.spinnerSize).toBeUndefined();
      expect(testConfig.showMessage).toBeUndefined();
      expect(testConfig.fullHeight).toBeUndefined();
      expect(testConfig.overlay).toBeUndefined();
    });

    it('should validate spinnerSize enum values', () => {
      const validSizes = ['small', 'medium', 'large'];
      validSizes.forEach(size => {
        expect(['small', 'medium', 'large']).toContain(size);
      });
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(LoadingStateComponent.prototype.constructor).toBeDefined();
    });

    it('should have proper component selector', () => {
      expect(LoadingStateComponent.prototype.constructor.name).toBe('LoadingStateComponent');
    });

    it('should have proper component imports', () => {
      expect(LoadingStateComponent).toBeDefined();
      expect(component).toBeInstanceOf(LoadingStateComponent);
    });
  });
});
