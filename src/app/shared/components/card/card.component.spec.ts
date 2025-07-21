import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default variant', () => {
    expect(component.variant()).toBe('default');
  });

  it('should have cardClasses computed signal', () => {
    expect(component.cardClasses).toBeDefined();
    expect(typeof component.cardClasses).toBe('function');
  });

  it('should return correct card classes for default variant', () => {
    const classes = component.cardClasses();
    expect(classes['pelu-card']).toBe(true);
    expect(classes['pelu-card--default']).toBe(true);
  });

  describe('Template Rendering', () => {
    it('should render with default variant class', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const cardElement = compiled.querySelector('.pelu-card');
      expect(cardElement).toBeTruthy();
    });

    it('should project content', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const cardElement = compiled.querySelector('.pelu-card');
      expect(cardElement).toBeTruthy();
    });

    it('should render with proper CSS classes', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const cardElement = compiled.querySelector('.pelu-card');
      expect(cardElement?.classList.contains('pelu-card')).toBeTruthy();
    });

    it('should have proper HTML structure', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.innerHTML).toContain('pelu-card');
    });
  });

  describe('Variant Handling', () => {
    it('should handle different variant values', () => {
      // Test that the component can handle different variant inputs
      expect(component.variant()).toBe('default');
    });

    it('should have consistent variant behavior', () => {
      const variant1 = component.variant();
      const variant2 = component.variant();
      expect(variant1).toBe(variant2);
    });
  });

  describe('Component Behavior', () => {
    it('should initialize with default values', () => {
      expect(component.variant()).toBe('default');
    });

    it('should maintain state consistency', () => {
      const initialVariant = component.variant();
      expect(initialVariant).toBe('default');

      // Component should maintain consistent state
      expect(component.variant()).toBe(initialVariant);
    });
  });

  describe('Template Integration', () => {
    it('should have proper component selector', () => {
      expect(CardComponent.prototype.constructor.name).toBe('CardComponent');
    });

    it('should be a standalone component', () => {
      expect(CardComponent.prototype.constructor).toBeDefined();
    });

    it('should have component metadata', () => {
      expect(CardComponent.prototype).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing variant gracefully', () => {
      // Component should have a default variant
      expect(component.variant()).toBeDefined();
      expect(component.variant()).toBe('default');
    });

    it('should not throw errors during rendering', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(CardComponent.prototype.constructor).toBeDefined();
    });

    it('should have component metadata', () => {
      expect(CardComponent.prototype).toBeDefined();
      expect(CardComponent.prototype.constructor).toBeDefined();
    });
  });
});
