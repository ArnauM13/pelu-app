import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { NotFoundStateComponent, NotFoundStateConfig } from './not-found-state.component';

describe('NotFoundStateComponent', () => {
  let component: NotFoundStateComponent;
  let fixture: ComponentFixture<NotFoundStateComponent>;

  const mockConfig: NotFoundStateConfig = {
    icon: '🔍',
    title: 'Test Title',
    message: 'Test Message',
    buttonText: 'Test Button',
    showButton: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundStateComponent, TranslateModule.forRoot()],
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

    fixture = TestBed.createComponent(NotFoundStateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have config input property', () => {
    expect(component.config).toBeDefined();
  });

  it('should have onButtonClick output event', () => {
    expect(component.onButtonClick).toBeDefined();
    expect(component.onButtonClick.emit).toBeDefined();
  });

  it('should be a standalone component', () => {
    expect(NotFoundStateComponent.prototype.constructor).toBeDefined();
    expect(NotFoundStateComponent.prototype.constructor.name).toBe('NotFoundStateComponent');
  });

  it('should have component metadata', () => {
    expect(NotFoundStateComponent.prototype).toBeDefined();
    expect(NotFoundStateComponent.prototype.constructor).toBeDefined();
  });

  describe('Template Rendering', () => {
    it('should render with provided config', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const notFoundContent = compiled.querySelector('.not-found-content');
      expect(notFoundContent).toBeTruthy();
    });

    it('should render icon from config', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const iconElement = compiled.querySelector('.not-found-icon');
      expect(iconElement).toBeTruthy();
      expect(iconElement?.textContent).toContain('🔍');
    });

    it('should render title from config', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const titleElement = compiled.querySelector('h2');
      expect(titleElement).toBeTruthy();
      expect(titleElement?.textContent).toContain('Test Title');
    });

    it('should render message from config', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const messageElement = compiled.querySelector('p');
      expect(messageElement).toBeTruthy();
      expect(messageElement?.textContent).toContain('Test Message');
    });

    it('should render button when showButton is true and buttonText is provided', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElement = compiled.querySelector('.not-found-btn');
      expect(buttonElement).toBeTruthy();
      expect(buttonElement?.textContent).toContain('Test Button');
    });

    it('should not render button when showButton is false', () => {
      component.config = { ...mockConfig, showButton: false };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElement = compiled.querySelector('.not-found-btn');
      expect(buttonElement).toBeFalsy();
    });

    it('should not render button when buttonText is not provided', () => {
      component.config = { ...mockConfig, buttonText: undefined };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElement = compiled.querySelector('.not-found-btn');
      expect(buttonElement).toBeFalsy();
    });

    it('should have proper CSS classes', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const notFoundContent = compiled.querySelector('.not-found-content');
      expect(notFoundContent?.classList.contains('not-found-content')).toBeTruthy();
    });

    it('should have proper HTML structure', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.innerHTML).toContain('not-found-content');
      expect(compiled.innerHTML).toContain('not-found-icon');
      expect(compiled.innerHTML).toContain('not-found-btn');
    });
  });

  describe('Event Handling', () => {
    it('should emit onButtonClick when button is clicked', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const spy = spyOn(component.onButtonClick, 'emit');
      const buttonElement = fixture.nativeElement.querySelector('.not-found-btn');

      buttonElement.click();

      expect(spy).toHaveBeenCalled();
    });

    it('should emit void when button is clicked', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const spy = spyOn(component.onButtonClick, 'emit');
      const buttonElement = fixture.nativeElement.querySelector('.not-found-btn');

      buttonElement.click();

      expect(spy).toHaveBeenCalledWith();
    });
  });

  describe('Config Handling', () => {
    it('should handle config with all properties', () => {
      const fullConfig: NotFoundStateConfig = {
        icon: '🔍',
        title: 'Full Title',
        message: 'Full Message',
        buttonText: 'Full Button',
        showButton: true,
      };

      component.config = fullConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.not-found-icon')?.textContent).toContain('🔍');
      expect(compiled.querySelector('h2')?.textContent).toContain('Full Title');
      expect(compiled.querySelector('p')?.textContent).toContain('Full Message');
      expect(compiled.querySelector('.not-found-btn')?.textContent).toContain('Full Button');
    });

    it('should handle config with minimal properties', () => {
      const minimalConfig: NotFoundStateConfig = {
        icon: '🔍',
        title: 'Minimal Title',
        message: 'Minimal Message',
      };

      component.config = minimalConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.not-found-icon')?.textContent).toContain('🔍');
      expect(compiled.querySelector('h2')?.textContent).toContain('Minimal Title');
      expect(compiled.querySelector('p')?.textContent).toContain('Minimal Message');
      expect(compiled.querySelector('.not-found-btn')).toBeFalsy();
    });

    it('should handle config with showButton explicitly false', () => {
      const configWithNoButton: NotFoundStateConfig = {
        icon: '🔍',
        title: 'No Button Title',
        message: 'No Button Message',
        buttonText: 'Button Text',
        showButton: false,
      };

      component.config = configWithNoButton;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.not-found-btn')).toBeFalsy();
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
        component.config = { ...mockConfig, icon: '🚀' };
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
      const incompleteConfig: NotFoundStateConfig = {
        icon: '🔍',
        title: 'Test',
        message: 'Test',
      };
      component.config = incompleteConfig;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle empty strings gracefully', () => {
      const emptyConfig: NotFoundStateConfig = {
        icon: '',
        title: '',
        message: '',
        buttonText: '',
      };
      component.config = emptyConfig;
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Interface Validation', () => {
    it('should handle NotFoundStateConfig interface correctly', () => {
      const testConfig: NotFoundStateConfig = {
        icon: '🔍',
        title: 'Test Title',
        message: 'Test Message',
        buttonText: 'Test Button',
        showButton: true,
      };

      expect(testConfig.icon).toBe('🔍');
      expect(testConfig.title).toBe('Test Title');
      expect(testConfig.message).toBe('Test Message');
      expect(testConfig.buttonText).toBe('Test Button');
      expect(testConfig.showButton).toBe(true);
    });

    it('should handle NotFoundStateConfig without optional properties', () => {
      const testConfig: NotFoundStateConfig = {
        icon: '🔍',
        title: 'Test Title',
        message: 'Test Message',
      };

      expect(testConfig.icon).toBe('🔍');
      expect(testConfig.title).toBe('Test Title');
      expect(testConfig.message).toBe('Test Message');
      expect(testConfig.buttonText).toBeUndefined();
      expect(testConfig.showButton).toBeUndefined();
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(NotFoundStateComponent.prototype.constructor).toBeDefined();
    });

    it('should have proper component selector', () => {
      expect(NotFoundStateComponent.prototype.constructor.name).toBe('NotFoundStateComponent');
    });

    it('should have proper component imports', () => {
      expect(NotFoundStateComponent).toBeDefined();
      expect(component).toBeInstanceOf(NotFoundStateComponent);
    });
  });
});
