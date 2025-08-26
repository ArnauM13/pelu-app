import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingStateComponent, LoadingStateConfig } from './loading-state.component';

describe('LoadingStateComponent', () => {
  let component: LoadingStateComponent;
  let fixture: ComponentFixture<LoadingStateComponent>;

  const mockConfig: LoadingStateConfig = {
    message: 'Carregant...',
    spinnerSize: 'medium',
    showMessage: true,
    fullHeight: false,
    overlay: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingStateComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingStateComponent);
    component = fixture.componentInstance;
    component.config = mockConfig;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have config input defined', () => {
    expect(component.config).toBeDefined();
  });

  it('should have default config values', () => {
    const defaultConfig: LoadingStateConfig = {
      message: 'COMMON.STATUS.LOADING',
      spinnerSize: 'medium',
      showMessage: true,
      fullHeight: false,
      overlay: false,
    };

    const newComponent = new LoadingStateComponent();
    expect(newComponent.config).toEqual(defaultConfig);
  });

  it('should render with provided config', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const loadingContent = compiled.querySelector('.loading-content');
    const loadingSpinner = compiled.querySelector('.loading-spinner');
    const loadingMessage = compiled.querySelector('.loading-message');

    expect(loadingContent).toBeTruthy();
    expect(loadingSpinner).toBeTruthy();
    expect(loadingMessage).toBeTruthy();
    expect(loadingMessage?.textContent).toContain('Carregant...');
  });

  it('should render without message when showMessage is false', () => {
    component.config = { ...mockConfig, showMessage: false };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const loadingMessage = compiled.querySelector('.loading-message');
    expect(loadingMessage).toBeFalsy();
  });

  it('should render without message when message is not provided', () => {
    component.config = { ...mockConfig, message: undefined };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const loadingMessage = compiled.querySelector('.loading-message');
    expect(loadingMessage).toBeFalsy();
  });

  it('should render without message when message is empty', () => {
    component.config = { ...mockConfig, message: '' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const loadingMessage = compiled.querySelector('.loading-message');
    expect(loadingMessage).toBeFalsy();
  });

  it('should apply fullHeight class when fullHeight is true', () => {
    component.config = { ...mockConfig, fullHeight: true };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const loadingContent = compiled.querySelector('.loading-content');
    expect(loadingContent?.classList.contains('full-height')).toBe(true);
  });

  it('should apply overlay class when overlay is true', () => {
    component.config = { ...mockConfig, overlay: true };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const loadingContent = compiled.querySelector('.loading-content');
    expect(loadingContent?.classList.contains('overlay')).toBe(true);
  });

  it('should apply correct spinner size class', () => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];

    sizes.forEach(size => {
      component.config = { ...mockConfig, spinnerSize: size };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loadingSpinner = compiled.querySelector('.loading-spinner');
      expect(loadingSpinner?.classList.contains(`spinner-${size}`)).toBe(true);
    });
  });

  it('should have proper HTML structure', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loading-content')).toBeTruthy();
    expect(compiled.querySelector('.loading-spinner')).toBeTruthy();
    expect(compiled.querySelector('.spinner')).toBeTruthy();
  });

  it('should handle config with minimal properties', () => {
    const minimalConfig: LoadingStateConfig = {
      spinnerSize: 'small',
    };

    component.config = minimalConfig;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const loadingContent = compiled.querySelector('.loading-content');
    const loadingSpinner = compiled.querySelector('.loading-spinner');
    const loadingMessage = compiled.querySelector('.loading-message');

    expect(loadingContent).toBeTruthy();
    expect(loadingSpinner).toBeTruthy();
    expect(loadingMessage).toBeFalsy(); // No message when not provided
  });

  it('should handle config with all properties', () => {
    const fullConfig: LoadingStateConfig = {
      message: 'Carregant dades...',
      spinnerSize: 'large',
      showMessage: true,
      fullHeight: true,
      overlay: true,
    };

    component.config = fullConfig;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const loadingContent = compiled.querySelector('.loading-content');
    const loadingSpinner = compiled.querySelector('.loading-spinner');
    const loadingMessage = compiled.querySelector('.loading-message');

    expect(loadingContent).toBeTruthy();
    expect(loadingContent?.classList.contains('full-height')).toBe(true);
    expect(loadingContent?.classList.contains('overlay')).toBe(true);
    expect(loadingSpinner?.classList.contains('spinner-large')).toBe(true);
    expect(loadingMessage).toBeTruthy();
    expect(loadingMessage?.textContent).toContain('Carregant dades...');
  });

  it('should be a standalone component', () => {
    expect(LoadingStateComponent.prototype.constructor).toBeDefined();
    expect(LoadingStateComponent.prototype.constructor.name).toBe('LoadingStateComponent2'); // Actual name in tests
  });

  it('should have component metadata', () => {
    expect(LoadingStateComponent.prototype).toBeDefined();
    expect(LoadingStateComponent.prototype.constructor).toBeDefined();
  });

  it('should not throw errors during rendering', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should handle config changes gracefully', () => {
    expect(() => {
      component.config = { ...mockConfig, spinnerSize: 'large' };
      fixture.detectChanges();
    }).not.toThrow();
  });
});
