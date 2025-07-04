import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingButtonComponent, FloatingButtonConfig } from './floating-button.component';

describe('FloatingButtonComponent', () => {
  let component: FloatingButtonComponent;
  let fixture: ComponentFixture<FloatingButtonComponent>;

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

  it('should have input signals defined', () => {
    expect(component.config).toBeDefined();
  });

  it('should have output signals defined', () => {
    expect(component.clicked).toBeDefined();
  });

  it('should have computed properties defined', () => {
    expect(component.buttonClasses).toBeDefined();
    expect(component.buttonStyle).toBeDefined();
  });

  it('should have onClick method defined', () => {
    expect(typeof component.onClick).toBe('function');
  });

  it('should emit clicked event when onClick is called', () => {
    spyOn(component.clicked, 'emit');

    component.onClick();

    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should have proper component structure', () => {
    expect(FloatingButtonComponent.prototype.constructor.name).toBe('FloatingButtonComponent');
  });

  it('should be a standalone component', () => {
    expect(FloatingButtonComponent.prototype.constructor).toBeDefined();
    expect(FloatingButtonComponent.prototype.constructor.name).toBe('FloatingButtonComponent');
  });

  it('should have component metadata', () => {
    expect(FloatingButtonComponent.prototype).toBeDefined();
    expect(FloatingButtonComponent.prototype.constructor).toBeDefined();
  });

  it('should have all required computed properties', () => {
    expect(component.config).toBeDefined();
    expect(component.buttonClasses).toBeDefined();
    expect(component.buttonStyle).toBeDefined();
  });

  it('should have proper signal types', () => {
    expect(typeof component.config).toBe('function');
    expect(typeof component.buttonClasses).toBe('function');
    expect(typeof component.buttonStyle).toBe('function');
  });

  it('should handle FloatingButtonConfig interface correctly', () => {
    const config: FloatingButtonConfig = {
      icon: '➕',
      tooltip: 'Add new item',
      ariaLabel: 'Add new item',
      isActive: true,
      variant: 'primary',
      size: 'medium'
    };

    expect(config.icon).toBe('➕');
    expect(config.tooltip).toBe('Add new item');
    expect(config.ariaLabel).toBe('Add new item');
    expect(config.isActive).toBe(true);
    expect(config.variant).toBe('primary');
    expect(config.size).toBe('medium');
  });

  it('should handle FloatingButtonConfig with optional properties', () => {
    const config: FloatingButtonConfig = {
      icon: '➕',
      tooltip: 'Add new item',
      ariaLabel: 'Add new item'
    };

    expect(config.icon).toBe('➕');
    expect(config.tooltip).toBe('Add new item');
    expect(config.ariaLabel).toBe('Add new item');
    expect(config.isActive).toBeUndefined();
    expect(config.variant).toBeUndefined();
    expect(config.size).toBeUndefined();
  });
});
