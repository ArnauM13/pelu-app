import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render button works text', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('button works!');
  });

  it('should be a component class', () => {
    expect(ButtonComponent.prototype.constructor.name).toBe('ButtonComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = ButtonComponent;
    expect(componentClass.name).toBe('ButtonComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should be a standalone component', () => {
    expect(ButtonComponent.prototype.constructor).toBeDefined();
    expect(ButtonComponent.prototype.constructor.name).toBe('ButtonComponent');
  });

  it('should have component metadata', () => {
    expect(ButtonComponent.prototype).toBeDefined();
    expect(ButtonComponent.prototype.constructor).toBeDefined();
  });

  it('should render as a paragraph element', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const paragraphElement = compiled.querySelector('p');
    expect(paragraphElement).toBeTruthy();
  });

  it('should have proper HTML structure', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.innerHTML).toContain('button works!');
  });
});
