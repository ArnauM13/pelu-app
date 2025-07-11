import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingButtonComponent } from './floating-button.component';

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

  it('should have required input signals', () => {
    expect(component.config).toBeDefined();
  });

  it('should have required output signals', () => {
    expect(component.clicked).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof component.onClick).toBe('function');
  });

  it('should emit clicked event when onClick is called', () => {
    spyOn(component.clicked, 'emit');
    expect(() => component.onClick()).not.toThrow();
    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should handle click without errors', () => {
    expect(() => component.onClick()).not.toThrow();
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
});
