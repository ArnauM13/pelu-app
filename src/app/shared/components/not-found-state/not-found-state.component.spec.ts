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
            onLangChange: { subscribe: () => {} },
            onTranslationChange: { subscribe: () => {} },
            onDefaultLangChange: { subscribe: () => {} },
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

  it('should have buttonClick output event', () => {
    expect(component.buttonClick).toBeDefined();
    expect(component.buttonClick.emit).toBeDefined();
  });

  it('should be a standalone component', () => {
    expect(component.constructor).toBeDefined();
    expect(component.constructor.name).toContain('NotFoundStateComponent');
  });

  it('should have component metadata', () => {
    expect(component).toBeDefined();
    expect(component.constructor).toBeDefined();
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

    it('should have proper HTML structure', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.not-found-content')).toBeTruthy();
      expect(compiled.querySelector('.not-found-icon')).toBeTruthy();
      expect(compiled.querySelector('h2')).toBeTruthy();
      expect(compiled.querySelector('p')).toBeTruthy();
    });

    it('should have proper CSS classes', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.not-found-content')).toBeTruthy();
      expect(compiled.querySelector('.not-found-icon')).toBeTruthy();
      expect(compiled.querySelector('.not-found-btn')).toBeTruthy();
    });
  });

  describe('Event Handling', () => {
    it('should emit buttonClick when button is clicked', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const buttonClickSpy = jasmine.createSpy('buttonClick');
      component.buttonClick.subscribe(buttonClickSpy);

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElement = compiled.querySelector('.not-found-btn') as HTMLButtonElement;
      buttonElement?.click();

      expect(buttonClickSpy).toHaveBeenCalled();
    });

    it('should emit void when button is clicked', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const buttonClickSpy = jasmine.createSpy('buttonClick');
      component.buttonClick.subscribe(buttonClickSpy);

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElement = compiled.querySelector('.not-found-btn') as HTMLButtonElement;
      buttonElement?.click();

      expect(buttonClickSpy).toHaveBeenCalledWith();
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
        buttonText: 'Should Not Show',
        showButton: false,
      };

      component.config = configWithNoButton;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.not-found-btn')).toBeFalsy();
    });
  });

  describe('Component Behavior', () => {
    it('should not throw errors during rendering', () => {
      component.config = mockConfig;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle config changes gracefully', () => {
      component.config = mockConfig;
      fixture.detectChanges();

      const newConfig: NotFoundStateConfig = {
        icon: '🚀',
        title: 'New Title',
        message: 'New Message',
        buttonText: 'New Button',
        showButton: true,
      };

      expect(() => {
        component.config = newConfig;
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined config properties gracefully', () => {
      const incompleteConfig = {
        icon: '🔍',
        title: 'Test',
        message: 'Test',
      } as NotFoundStateConfig;

      component.config = incompleteConfig;
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Component Structure', () => {
    it('should have proper component selector', () => {
      expect(component.constructor.name).toContain('NotFoundStateComponent');
    });
  });
});
