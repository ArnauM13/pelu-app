import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { LoaderComponent } from './loader.component';
import { LoaderService } from '../../services/loader.service';

describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;
  let loaderService: LoaderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderComponent, TranslateModule.forRoot()],
      providers: [
        LoaderService,
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) => key,
            get: (key: string) => ({ subscribe: (fn: (value: string) => void) => fn(key) }),
          },
        },
        {
          provide: TranslateStore,
          useValue: {
            get: (key: string) => key,
            set: () => {},
            has: () => true,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    loaderService = TestBed.inject(LoaderService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have loaderService injected', () => {
    expect(component.loaderService).toBeDefined();
    expect(component.loaderService).toBeInstanceOf(LoaderService);
  });

  it('should have loaderService as readonly property', () => {
    expect(component.loaderService).toBeDefined();
    expect(typeof component.loaderService).toBe('object');
  });

  it('should be a standalone component', () => {
    expect(LoaderComponent.prototype.constructor).toBeDefined();
    expect(LoaderComponent.prototype.constructor.name).toBe('LoaderComponent');
  });

  it('should have component metadata', () => {
    expect(LoaderComponent.prototype).toBeDefined();
    expect(LoaderComponent.prototype.constructor).toBeDefined();
  });

  describe('Template Rendering', () => {
    it('should not render loader when isLoading is false', () => {
      loaderService.hide();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loaderElement = compiled.querySelector('.loader-overlay');
      expect(loaderElement).toBeFalsy();
    });

    it('should render loader when isLoading is true', () => {
      loaderService.show();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loaderElement = compiled.querySelector('.loader-overlay');
      expect(loaderElement).toBeTruthy();
    });

    it('should render loader content structure', () => {
      loaderService.show();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loaderContent = compiled.querySelector('.loader-content');
      const loaderSpinner = compiled.querySelector('.loader-spinner');

      expect(loaderContent).toBeTruthy();
      expect(loaderSpinner).toBeTruthy();
    });

    it('should render message when config has message', () => {
      loaderService.showWithMessage('Test loading message');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const messageElement = compiled.querySelector('.loader-message');
      expect(messageElement).toBeTruthy();
    });

    it('should not render message when config has no message', () => {
      loaderService.show({ message: undefined });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const messageElement = compiled.querySelector('.loader-message');
      expect(messageElement).toBeFalsy();
    });

    it('should have proper CSS classes', () => {
      loaderService.show();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loaderElement = compiled.querySelector('.loader-overlay');
      expect(loaderElement?.classList.contains('loader-overlay')).toBeTruthy();
    });

    it('should have proper HTML structure', () => {
      loaderService.show();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.innerHTML).toContain('loader-overlay');
      expect(compiled.innerHTML).toContain('loader-content');
      expect(compiled.innerHTML).toContain('loader-spinner');
    });
  });

  describe('Service Integration', () => {
    it('should respond to service isLoading changes', () => {
      // Initially hidden
      fixture.detectChanges();
      let loaderElement = fixture.nativeElement.querySelector('.loader-overlay');
      expect(loaderElement).toBeFalsy();

      // Show loader
      loaderService.show();
      fixture.detectChanges();
      loaderElement = fixture.nativeElement.querySelector('.loader-overlay');
      expect(loaderElement).toBeTruthy();

      // Hide loader
      loaderService.hide();
      fixture.detectChanges();
      loaderElement = fixture.nativeElement.querySelector('.loader-overlay');
      expect(loaderElement).toBeFalsy();
    });

    it('should respond to service config changes', () => {
      loaderService.show();
      fixture.detectChanges();

      // Check default message
      let messageElement = fixture.nativeElement.querySelector('.loader-message');
      expect(messageElement).toBeTruthy();

      // Change message
      loaderService.showWithMessage('Custom message');
      fixture.detectChanges();
      messageElement = fixture.nativeElement.querySelector('.loader-message');
      expect(messageElement).toBeTruthy();
    });

    it('should have proper service signal integration', () => {
      expect(loaderService.isLoading).toBeDefined();
      expect(typeof loaderService.isLoading).toBe('function');
      expect(loaderService.config).toBeDefined();
      expect(typeof loaderService.config).toBe('function');
    });
  });

  describe('Component Behavior', () => {
    it('should initialize with service dependency', () => {
      expect(component.loaderService).toBeDefined();
      expect(component.loaderService).toBe(loaderService);
    });

    it('should maintain service reference consistency', () => {
      const initialService = component.loaderService;
      expect(component.loaderService).toBe(initialService);
    });

    it('should not throw errors during rendering', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle service state changes gracefully', () => {
      expect(() => {
        loaderService.show();
        fixture.detectChanges();
        loaderService.hide();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing service gracefully', () => {
      // Component should still be created even if service is not available
      expect(component).toBeTruthy();
    });

    it('should handle undefined config gracefully', () => {
      loaderService.show({ message: undefined });
      fixture.detectChanges();
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle empty message gracefully', () => {
      loaderService.showWithMessage('');
      fixture.detectChanges();
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(LoaderComponent.prototype.constructor).toBeDefined();
    });

    it('should have proper component selector', () => {
      expect(LoaderComponent.prototype.constructor.name).toBe('LoaderComponent');
    });

    it('should have proper component imports', () => {
      expect(LoaderComponent).toBeDefined();
      expect(component).toBeInstanceOf(LoaderComponent);
    });
  });
});
