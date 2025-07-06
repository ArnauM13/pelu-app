import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingButtonComponent, FloatingButtonConfig } from './floating-button.component';

describe('FloatingButtonComponent', () => {
  let component: FloatingButtonComponent;
  let fixture: ComponentFixture<FloatingButtonComponent>;

  const mockConfig: FloatingButtonConfig = {
    icon: '➕',
    tooltip: 'Add new item',
    ariaLabel: 'Add button',
    isActive: false,
    variant: 'primary',
    size: 'medium'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have config input signal', () => {
    expect(component.config).toBeDefined();
    expect(typeof component.config).toBe('function');
  });

  it('should have clicked output signal', () => {
    expect(component.clicked).toBeDefined();
    expect(typeof component.clicked.emit).toBe('function');
  });

  it('should have buttonClasses computed property', () => {
    expect(component.buttonClasses).toBeDefined();
    expect(typeof component.buttonClasses).toBe('function');
  });

  it('should have buttonStyle computed property', () => {
    expect(component.buttonStyle).toBeDefined();
    expect(typeof component.buttonStyle).toBe('function');
  });

  it('should emit clicked event when onClick is called', () => {
    spyOn(component.clicked, 'emit');

    component.onClick();

    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should generate correct button classes for primary variant', () => {
    const config: FloatingButtonConfig = {
      icon: '➕',
      tooltip: 'Test',
      ariaLabel: 'Test',
      variant: 'primary',
      size: 'medium',
      isActive: false
    };

    // Mock the config signal
    spyOn(component, 'config').and.returnValue(config);

    const classes = component.buttonClasses();

    expect(classes['floating-button']).toBe(true);
    expect(classes['floating-button--primary']).toBe(true);
    expect(classes['floating-button--medium']).toBe(true);
    expect(classes['floating-button--active']).toBe(false);
  });

  it('should generate correct button classes for secondary variant', () => {
    const config: FloatingButtonConfig = {
      icon: '➕',
      tooltip: 'Test',
      ariaLabel: 'Test',
      variant: 'secondary',
      size: 'large',
      isActive: true
    };

    spyOn(component, 'config').and.returnValue(config);

    const classes = component.buttonClasses();

    expect(classes['floating-button']).toBe(true);
    expect(classes['floating-button--secondary']).toBe(true);
    expect(classes['floating-button--large']).toBe(true);
    expect(classes['floating-button--active']).toBe(true);
  });

  it('should generate correct button classes for success variant', () => {
    const config: FloatingButtonConfig = {
      icon: '➕',
      tooltip: 'Test',
      ariaLabel: 'Test',
      variant: 'success',
      size: 'small',
      isActive: false
    };

    spyOn(component, 'config').and.returnValue(config);

    const classes = component.buttonClasses();

    expect(classes['floating-button']).toBe(true);
    expect(classes['floating-button--success']).toBe(true);
    expect(classes['floating-button--small']).toBe(true);
    expect(classes['floating-button--active']).toBe(false);
  });

  it('should generate correct button classes for danger variant', () => {
    const config: FloatingButtonConfig = {
      icon: '➕',
      tooltip: 'Test',
      ariaLabel: 'Test',
      variant: 'danger',
      size: 'medium',
      isActive: true
    };

    spyOn(component, 'config').and.returnValue(config);

    const classes = component.buttonClasses();

    expect(classes['floating-button']).toBe(true);
    expect(classes['floating-button--danger']).toBe(true);
    expect(classes['floating-button--medium']).toBe(true);
    expect(classes['floating-button--active']).toBe(true);
  });

  it('should use default variant when not specified', () => {
    const config: FloatingButtonConfig = {
      icon: '➕',
      tooltip: 'Test',
      ariaLabel: 'Test'
    };

    spyOn(component, 'config').and.returnValue(config);

    const classes = component.buttonClasses();

    expect(classes['floating-button--primary']).toBe(true);
  });

  it('should use default size when not specified', () => {
    const config: FloatingButtonConfig = {
      icon: '➕',
      tooltip: 'Test',
      ariaLabel: 'Test'
    };

    spyOn(component, 'config').and.returnValue(config);

    const classes = component.buttonClasses();

    expect(classes['floating-button--medium']).toBe(true);
  });

  it('should use default isActive when not specified', () => {
    const config: FloatingButtonConfig = {
      icon: '➕',
      tooltip: 'Test',
      ariaLabel: 'Test'
    };

    spyOn(component, 'config').and.returnValue(config);

    const classes = component.buttonClasses();

    expect(classes['floating-button--active']).toBe(false);
  });

  it('should generate correct button style with icon', () => {
    const config: FloatingButtonConfig = {
      icon: '🎯',
      tooltip: 'Test',
      ariaLabel: 'Test'
    };

    spyOn(component, 'config').and.returnValue(config);

    const style = component.buttonStyle();

    expect(style['--button-icon']).toBe('"🎯"');
  });

  it('should generate correct button style with different icon', () => {
    const config: FloatingButtonConfig = {
      icon: '⭐',
      tooltip: 'Test',
      ariaLabel: 'Test'
    };

    spyOn(component, 'config').and.returnValue(config);

    const style = component.buttonStyle();

    expect(style['--button-icon']).toBe('"⭐"');
  });

  it('should render button element', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttonElement = compiled.querySelector('button');
    expect(buttonElement).toBeTruthy();
  });

  it('should render with floating-button class', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttonElement = compiled.querySelector('.floating-button');
    expect(buttonElement).toBeTruthy();
  });

  it('should have onClick method', () => {
    expect(typeof component.onClick).toBe('function');
  });

  it('should be a standalone component', () => {
    expect(FloatingButtonComponent.prototype.constructor.name).toBe('FloatingButtonComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = FloatingButtonComponent;
    expect(componentClass.name).toBe('FloatingButtonComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should have component metadata', () => {
    expect(FloatingButtonComponent.prototype).toBeDefined();
    expect(FloatingButtonComponent.prototype.constructor).toBeDefined();
  });

    it('should validate FloatingButtonConfig interface properties', () => {
    const config: FloatingButtonConfig = {
      icon: '➕',
      tooltip: 'Test tooltip',
      ariaLabel: 'Test aria label',
      isActive: true,
      variant: 'primary',
      size: 'medium'
    };

    expect(config.icon).toBe('➕');
    expect(config.tooltip).toBe('Test tooltip');
    expect(config.ariaLabel).toBe('Test aria label');
    expect(config.isActive).toBe(true);
    expect(config.variant).toBe('primary');
    expect(config.size).toBe('medium');
  });
});
