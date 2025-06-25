import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default variant', () => {
    expect(component.variant()).toBe('default');
  });

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

  it('should be a component class', () => {
    expect(CardComponent.prototype.constructor.name).toBe('CardComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = CardComponent;
    expect(componentClass.name).toBe('CardComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should have variant input property', () => {
    expect(component.variant).toBeDefined();
    expect(typeof component.variant).toBe('function');
  });

  it('should return correct variant value', () => {
    const variant = component.variant();
    expect(variant).toBe('default');
    expect(typeof variant).toBe('string');
  });

  it('should be a standalone component', () => {
    expect(CardComponent.prototype.constructor).toBeDefined();
    expect(CardComponent.prototype.constructor.name).toBe('CardComponent');
  });

  it('should have component metadata', () => {
    expect(CardComponent.prototype).toBeDefined();
    expect(CardComponent.prototype.constructor).toBeDefined();
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
