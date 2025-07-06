import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FloatingButtonComponent, FloatingButtonConfig } from './floating-button.component';

// Test wrapper component to provide input signals
@Component({
  template: `
    <pelu-floating-button
      [config]="testConfig()"
      (clicked)="onClicked()">
    </pelu-floating-button>
  `,
  imports: [FloatingButtonComponent],
  standalone: true
})
class TestWrapperComponent {
  testConfig = signal<FloatingButtonConfig>({
    icon: '➕',
    tooltip: 'Add new item',
    ariaLabel: 'Add button',
    isActive: false,
    variant: 'primary',
    size: 'medium'
  });

  onClicked() {
    // Test method
  }
}

describe('FloatingButtonComponent', () => {
  let component: TestWrapperComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;
  let floatingButtonComponent: FloatingButtonComponent;

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
      imports: [TestWrapperComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    component = fixture.componentInstance;
    component.testConfig.set(mockConfig);
    fixture.detectChanges();

    floatingButtonComponent = fixture.debugElement.query(
      (de) => de.componentInstance instanceof FloatingButtonComponent
    ).componentInstance;
  });

  it('should create', () => {
    expect(floatingButtonComponent).toBeTruthy();
  });

  it('should have config input signal', () => {
    expect(floatingButtonComponent.config).toBeDefined();
    expect(typeof floatingButtonComponent.config).toBe('function');
  });

  it('should have clicked output signal', () => {
    expect(floatingButtonComponent.clicked).toBeDefined();
    expect(typeof floatingButtonComponent.clicked.emit).toBe('function');
  });

  it('should have buttonClasses computed property', () => {
    expect(floatingButtonComponent.buttonClasses).toBeDefined();
    expect(typeof floatingButtonComponent.buttonClasses).toBe('function');
  });

  it('should have buttonStyle computed property', () => {
    expect(floatingButtonComponent.buttonStyle).toBeDefined();
    expect(typeof floatingButtonComponent.buttonStyle).toBe('function');
  });

  it('should emit clicked event when onClick is called', () => {
    spyOn(floatingButtonComponent.clicked, 'emit');

    floatingButtonComponent.onClick();

    expect(floatingButtonComponent.clicked.emit).toHaveBeenCalled();
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

    component.testConfig.set(config);
    fixture.detectChanges();

    const classes = floatingButtonComponent.buttonClasses();

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

    component.testConfig.set(config);
    fixture.detectChanges();

    const classes = floatingButtonComponent.buttonClasses();

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

    component.testConfig.set(config);
    fixture.detectChanges();

    const classes = floatingButtonComponent.buttonClasses();

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

    component.testConfig.set(config);
    fixture.detectChanges();

    const classes = floatingButtonComponent.buttonClasses();

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

    component.testConfig.set(config);
    fixture.detectChanges();

    const classes = floatingButtonComponent.buttonClasses();

    expect(classes['floating-button--primary']).toBe(true);
  });

  it('should use default size when not specified', () => {
    const config: FloatingButtonConfig = {
      icon: '➕',
      tooltip: 'Test',
      ariaLabel: 'Test'
    };

    component.testConfig.set(config);
    fixture.detectChanges();

    const classes = floatingButtonComponent.buttonClasses();

    expect(classes['floating-button--medium']).toBe(true);
  });

  it('should use default isActive when not specified', () => {
    const config: FloatingButtonConfig = {
      icon: '➕',
      tooltip: 'Test',
      ariaLabel: 'Test'
    };

    component.testConfig.set(config);
    fixture.detectChanges();

    const classes = floatingButtonComponent.buttonClasses();

    expect(classes['floating-button--active']).toBe(false);
  });

  it('should generate correct button style with icon', () => {
    const config: FloatingButtonConfig = {
      icon: '🎯',
      tooltip: 'Test',
      ariaLabel: 'Test'
    };

    component.testConfig.set(config);
    fixture.detectChanges();

    const style = floatingButtonComponent.buttonStyle();

    expect(style['--button-icon']).toBe('"🎯"');
  });

  it('should generate correct button style with different icon', () => {
    const config: FloatingButtonConfig = {
      icon: '⭐',
      tooltip: 'Test',
      ariaLabel: 'Test'
    };

    component.testConfig.set(config);
    fixture.detectChanges();

    const style = floatingButtonComponent.buttonStyle();

    expect(style['--button-icon']).toBe('"⭐"');
  });

  it('should render button element', () => {
    const buttonElement = fixture.nativeElement.querySelector('.floating-button');
    expect(buttonElement).toBeTruthy();
  });

  it('should render with floating-button class', () => {
    const buttonElement = fixture.nativeElement.querySelector('.floating-button');
    expect(buttonElement).toBeTruthy();
  });

  it('should have correct aria-label', () => {
    const buttonElement = fixture.nativeElement.querySelector('.floating-button');
    expect(buttonElement.getAttribute('aria-label')).toBe('Add button');
  });

  it('should have correct tooltip', () => {
    const buttonElement = fixture.nativeElement.querySelector('.floating-button');
    expect(buttonElement.getAttribute('pTooltip')).toBe('Add new item');
  });

  it('should have correct icon', () => {
    const buttonElement = fixture.nativeElement.querySelector('.floating-button');
    expect(buttonElement.style.getPropertyValue('--button-icon')).toBe('"➕"');
  });

  it('should apply primary variant styles', () => {
    const buttonElement = fixture.nativeElement.querySelector('.floating-button');
    expect(buttonElement.classList.contains('floating-button--primary')).toBe(true);
  });

  it('should apply medium size styles', () => {
    const buttonElement = fixture.nativeElement.querySelector('.floating-button');
    expect(buttonElement.classList.contains('floating-button--medium')).toBe(true);
  });

  it('should not be active by default', () => {
    const buttonElement = fixture.nativeElement.querySelector('.floating-button');
    expect(buttonElement.classList.contains('floating-button--active')).toBe(false);
  });

  it('should be active when isActive is true', () => {
    const config: FloatingButtonConfig = {
      icon: '➕',
      tooltip: 'Test',
      ariaLabel: 'Test',
      isActive: true
    };

    component.testConfig.set(config);
    fixture.detectChanges();

    const buttonElement = fixture.nativeElement.querySelector('.floating-button');
    expect(buttonElement.classList.contains('floating-button--active')).toBe(true);
  });

  it('should handle click events', () => {
    spyOn(floatingButtonComponent.clicked, 'emit');
    const buttonElement = fixture.nativeElement.querySelector('.floating-button');

    buttonElement.click();

    expect(floatingButtonComponent.clicked.emit).toHaveBeenCalled();
  });

  it('should update styles when config changes', () => {
    const newConfig: FloatingButtonConfig = {
      icon: '🎯',
      tooltip: 'New tooltip',
      ariaLabel: 'New label',
      variant: 'danger',
      size: 'large',
      isActive: true
    };

    component.testConfig.set(newConfig);
    fixture.detectChanges();

    const buttonElement = fixture.nativeElement.querySelector('.floating-button');
    expect(buttonElement.getAttribute('aria-label')).toBe('New label');
    expect(buttonElement.getAttribute('pTooltip')).toBe('New tooltip');
    expect(buttonElement.style.getPropertyValue('--button-icon')).toBe('"🎯"');
    expect(buttonElement.classList.contains('floating-button--danger')).toBe(true);
    expect(buttonElement.classList.contains('floating-button--large')).toBe(true);
    expect(buttonElement.classList.contains('floating-button--active')).toBe(true);
  });
});
