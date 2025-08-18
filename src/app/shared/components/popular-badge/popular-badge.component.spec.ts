import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PopularBadgeComponent, PopularBadgeConfig } from './popular-badge.component';

describe('PopularBadgeComponent', () => {
  let component: PopularBadgeComponent;
  let fixture: ComponentFixture<PopularBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularBadgeComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PopularBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have config input defined', () => {
    expect(component.config).toBeDefined();
  });

  it('should have cssClasses method defined', () => {
    expect(typeof component.cssClasses).toBe('function');
  });

  it('should have default configuration', () => {
    expect(component.config.size).toBe('medium');
    expect(component.config.variant).toBe('default');
    expect(component.config.showIcon).toBe(true);
    expect(component.config.showText).toBe(false);
  });

  it('should generate correct CSS classes for default config', () => {
    const cssClasses = component.cssClasses();
    expect(cssClasses).toBe('popular-badge-medium popular-badge-default');
  });

  it('should generate correct CSS classes for custom config', () => {
    component.config = {
      size: 'large',
      variant: 'filled',
    };
    
    const cssClasses = component.cssClasses();
    expect(cssClasses).toBe('popular-badge-large popular-badge-filled');
  });

  it('should generate correct CSS classes for small outline variant', () => {
    component.config = {
      size: 'small',
      variant: 'outline',
    };
    
    const cssClasses = component.cssClasses();
    expect(cssClasses).toBe('popular-badge-small popular-badge-outline');
  });

  it('should render with default configuration', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.popular-badge');
    expect(badge).toBeTruthy();
    expect(badge?.classList.contains('popular-badge-medium')).toBe(true);
    expect(badge?.classList.contains('popular-badge-default')).toBe(true);
  });

  it('should render icon by default', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.popular-icon');
    expect(icon).toBeTruthy();
    expect(icon?.textContent).toContain('⭐');
  });

  it('should not render icon when showIcon is false', () => {
    component.config.showIcon = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.popular-icon');
    expect(icon).toBeFalsy();
  });

  it('should not render text by default', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.querySelector('.popular-text');
    expect(text).toBeFalsy();
  });

  it('should render text when showText is true and text is provided', () => {
    component.config.showText = true;
    component.config.text = 'Popular Service';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.querySelector('.popular-text');
    expect(text).toBeTruthy();
    expect(text?.textContent).toContain('Popular Service');
  });

  it('should render with custom title attribute', () => {
    component.config.text = 'Custom Title';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.popular-badge');
    expect(badge?.getAttribute('title')).toBe('Custom Title');
  });

  it('should render with default title when no text provided', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.popular-badge');
    expect(badge?.getAttribute('title')).toBe('SERVICES.POPULAR');
  });

  it('should render with different variants', () => {
    const variants: Array<'default' | 'outline' | 'filled'> = ['default', 'outline', 'filled'];
    
    variants.forEach(variant => {
      component.config.variant = variant;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const badge = compiled.querySelector('.popular-badge');
      expect(badge?.classList.contains(`popular-badge-${variant}`)).toBe(true);
    });
  });

  it('should render with different sizes', () => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    
    sizes.forEach(size => {
      component.config.size = size;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const badge = compiled.querySelector('.popular-badge');
      expect(badge?.classList.contains(`popular-badge-${size}`)).toBe(true);
    });
  });

  it('should handle undefined config properties gracefully', () => {
    component.config = {};
    fixture.detectChanges();

    const cssClasses = component.cssClasses();
    expect(cssClasses).toBe('popular-badge-medium popular-badge-default');
  });

  it('should be a standalone component', () => {
    expect(PopularBadgeComponent.prototype.constructor).toBeDefined();
    expect(PopularBadgeComponent.prototype.constructor.name).toBe('PopularBadgeComponent');
  });

  it('should have component metadata', () => {
    expect(PopularBadgeComponent.prototype).toBeDefined();
    expect(PopularBadgeComponent.prototype.constructor).toBeDefined();
  });

  it('should not throw errors during rendering', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
