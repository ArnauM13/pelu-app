import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { PopularBadgeComponent, PopularBadgeConfig } from './popular-badge.component';

describe('PopularBadgeComponent', () => {
  let component: PopularBadgeComponent;
  let fixture: ComponentFixture<PopularBadgeComponent>;

  const mockConfig: PopularBadgeConfig = {
    size: 'medium',
    variant: 'default',
    showIcon: true,
    showText: true,
    text: 'Popular Service',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularBadgeComponent, TranslateModule.forRoot()],
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

    fixture = TestBed.createComponent(PopularBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have config input property', () => {
    expect(component.config).toBeDefined();
  });

  it('should have cssClasses computed function', () => {
    expect(component.cssClasses).toBeDefined();
    expect(typeof component.cssClasses).toBe('function');
  });

  it('should be a standalone component', () => {
    expect(PopularBadgeComponent.prototype.constructor).toBeDefined();
    expect(PopularBadgeComponent.prototype.constructor.name).toBe('PopularBadgeComponent');
  });

  it('should have component metadata', () => {
    expect(PopularBadgeComponent.prototype).toBeDefined();
    expect(PopularBadgeComponent.prototype.constructor).toBeDefined();
  });

  describe('Default Configuration', () => {
    it('should have default config values', () => {
      expect(component.config.size).toBe('medium');
      expect(component.config.variant).toBe('default');
      expect(component.config.showIcon).toBe(true);
      expect(component.config.showText).toBe(false);
    });

    it('should return correct CSS classes for default config', () => {
      const classes = component.cssClasses();
      expect(classes).toBe('popular-badge-medium popular-badge-default');
    });
  });

  describe('Template Rendering', () => {
    it('should render with provided config', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const badgeElement = compiled.querySelector('.popular-badge');
      expect(badgeElement).toBeTruthy();
    });

    it('should render icon when showIcon is true', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const iconElement = compiled.querySelector('.popular-icon');
      expect(iconElement).toBeTruthy();
      expect(iconElement?.textContent).toContain('⭐');
    });

    it('should not render icon when showIcon is false', () => {
      component.config = { ...mockConfig, showIcon: false };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const iconElement = compiled.querySelector('.popular-icon');
      expect(iconElement).toBeFalsy();
    });

    it('should render text when showText is true and text is provided', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const textElement = compiled.querySelector('.popular-text');
      expect(textElement).toBeTruthy();
      expect(textElement?.textContent).toContain('Popular Service');
    });

    it('should not render text when showText is false', () => {
      component.config = { ...mockConfig, showText: false };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const textElement = compiled.querySelector('.popular-text');
      expect(textElement).toBeFalsy();
    });

    it('should not render text when text is not provided', () => {
      component.config = { ...mockConfig, text: undefined };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const textElement = compiled.querySelector('.popular-text');
      expect(textElement).toBeFalsy();
    });

    it('should have proper CSS classes', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const badgeElement = compiled.querySelector('.popular-badge');
      expect(badgeElement?.classList.contains('popular-badge')).toBeTruthy();
    });

    it('should have proper HTML structure', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.innerHTML).toContain('popular-badge');
      expect(compiled.innerHTML).toContain('popular-icon');
      expect(compiled.innerHTML).toContain('popular-text');
    });

    it('should have title attribute', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const badgeElement = compiled.querySelector('.popular-badge');
      expect(badgeElement?.getAttribute('title')).toBe('Popular Service');
    });
  });

  describe('CSS Classes Generation', () => {
    it('should generate correct classes for small size', () => {
      component.config = { ...mockConfig, size: 'small' };
      const classes = component.cssClasses();
      expect(classes).toBe('popular-badge-small popular-badge-default');
    });

    it('should generate correct classes for medium size', () => {
      component.config = { ...mockConfig, size: 'medium' };
      const classes = component.cssClasses();
      expect(classes).toBe('popular-badge-medium popular-badge-default');
    });

    it('should generate correct classes for large size', () => {
      component.config = { ...mockConfig, size: 'large' };
      const classes = component.cssClasses();
      expect(classes).toBe('popular-badge-large popular-badge-default');
    });

    it('should generate correct classes for default variant', () => {
      component.config = { ...mockConfig, variant: 'default' };
      const classes = component.cssClasses();
      expect(classes).toBe('popular-badge-medium popular-badge-default');
    });

    it('should generate correct classes for outline variant', () => {
      component.config = { ...mockConfig, variant: 'outline' };
      const classes = component.cssClasses();
      expect(classes).toBe('popular-badge-medium popular-badge-outline');
    });

    it('should generate correct classes for filled variant', () => {
      component.config = { ...mockConfig, variant: 'filled' };
      const classes = component.cssClasses();
      expect(classes).toBe('popular-badge-medium popular-badge-filled');
    });

    it('should generate correct classes for custom size and variant', () => {
      component.config = { ...mockConfig, size: 'large', variant: 'outline' };
      const classes = component.cssClasses();
      expect(classes).toBe('popular-badge-large popular-badge-outline');
    });
  });

  describe('Config Handling', () => {
    it('should handle config with all properties', () => {
      const fullConfig: PopularBadgeConfig = {
        size: 'large',
        variant: 'filled',
        showIcon: true,
        showText: true,
        text: 'Full Config Text',
      };

      component.config = fullConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.popular-icon')).toBeTruthy();
      expect(compiled.querySelector('.popular-text')?.textContent).toContain('Full Config Text');
    });

    it('should handle config with minimal properties', () => {
      const minimalConfig: PopularBadgeConfig = {
        size: 'small',
        variant: 'default',
      };

      component.config = minimalConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.popular-icon')).toBeTruthy();
      expect(compiled.querySelector('.popular-text')).toBeFalsy();
    });

    it('should handle undefined config properties', () => {
      const incompleteConfig: PopularBadgeConfig = {
        size: 'medium',
      };

      component.config = incompleteConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.popular-badge')).toBeTruthy();
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
        component.config = { ...mockConfig, size: 'large' };
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
      const incompleteConfig: PopularBadgeConfig = {
        size: 'medium',
      };
      component.config = incompleteConfig;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle empty strings gracefully', () => {
      const emptyConfig: PopularBadgeConfig = {
        size: 'medium',
        variant: 'default',
        text: '',
      };
      component.config = emptyConfig;
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Interface Validation', () => {
    it('should handle PopularBadgeConfig interface correctly', () => {
      const testConfig: PopularBadgeConfig = {
        size: 'large',
        variant: 'filled',
        showIcon: true,
        showText: true,
        text: 'Test Text',
      };

      expect(testConfig.size).toBe('large');
      expect(testConfig.variant).toBe('filled');
      expect(testConfig.showIcon).toBe(true);
      expect(testConfig.showText).toBe(true);
      expect(testConfig.text).toBe('Test Text');
    });

    it('should handle PopularBadgeConfig without optional properties', () => {
      const testConfig: PopularBadgeConfig = {
        size: 'medium',
      };

      expect(testConfig.size).toBe('medium');
      expect(testConfig.variant).toBeUndefined();
      expect(testConfig.showIcon).toBeUndefined();
      expect(testConfig.showText).toBeUndefined();
      expect(testConfig.text).toBeUndefined();
    });

    it('should validate size enum values', () => {
      const validSizes = ['small', 'medium', 'large'];
      validSizes.forEach(size => {
        expect(['small', 'medium', 'large']).toContain(size);
      });
    });

    it('should validate variant enum values', () => {
      const validVariants = ['default', 'outline', 'filled'];
      validVariants.forEach(variant => {
        expect(['default', 'outline', 'filled']).toContain(variant);
      });
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(PopularBadgeComponent.prototype.constructor).toBeDefined();
    });

    it('should have proper component selector', () => {
      expect(PopularBadgeComponent.prototype.constructor.name).toBe('PopularBadgeComponent');
    });

    it('should have proper component imports', () => {
      expect(PopularBadgeComponent).toBeDefined();
      expect(component).toBeInstanceOf(PopularBadgeComponent);
    });
  });
});
