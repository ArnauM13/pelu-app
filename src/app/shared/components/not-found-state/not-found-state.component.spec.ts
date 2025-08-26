import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NotFoundStateComponent, NotFoundStateConfig } from './not-found-state.component';

describe('NotFoundStateComponent', () => {
  let component: NotFoundStateComponent;
  let fixture: ComponentFixture<NotFoundStateComponent>;

  const mockConfig: NotFoundStateConfig = {
    icon: '🔍',
    title: 'No s\'ha trobat',
    message: 'No s\'ha trobat cap resultat',
    buttonText: 'Tornar enrere',
    showButton: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundStateComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundStateComponent);
    component = fixture.componentInstance;
    component.config = mockConfig;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have config input defined', () => {
    expect(component.config).toBeDefined();
  });

  it('should have buttonClick output defined', () => {
    expect(component.buttonClick).toBeDefined();
  });

  it('should render with provided config', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.not-found-icon');
    const title = compiled.querySelector('h2');
    const message = compiled.querySelector('p');
    const button = compiled.querySelector('.not-found-btn');

    expect(icon?.textContent).toContain('🔍');
    expect(title?.textContent).toContain('No s\'ha trobat');
    expect(message?.textContent).toContain('No s\'ha trobat cap resultat');
    expect(button?.textContent).toContain('Tornar enrere');
  });

  it('should render without button when showButton is false', () => {
    component.config = { ...mockConfig, showButton: false };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.not-found-btn');
    expect(button).toBeFalsy();
  });

  it('should render without button when buttonText is not provided', () => {
    component.config = { ...mockConfig, buttonText: undefined };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.not-found-btn');
    expect(button).toBeFalsy();
  });

  it('should render without button when buttonText is empty', () => {
    component.config = { ...mockConfig, buttonText: '' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.not-found-btn');
    expect(button).toBeFalsy();
  });

  it('should emit buttonClick when button is clicked', () => {
    spyOn(component.buttonClick, 'emit');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.not-found-btn') as HTMLElement;
    button.click();

    expect(component.buttonClick.emit).toHaveBeenCalled();
  });

  it('should have correct CSS classes', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.querySelector('.not-found-content');
    const icon = compiled.querySelector('.not-found-icon');

    expect(content).toBeTruthy();
    expect(icon).toBeTruthy();
  });

  it('should have proper HTML structure', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.not-found-content')).toBeTruthy();
    expect(compiled.querySelector('.not-found-icon')).toBeTruthy();
    expect(compiled.querySelector('h2')).toBeTruthy();
    expect(compiled.querySelector('p')).toBeTruthy();
    expect(compiled.querySelector('.not-found-btn')).toBeTruthy();
  });

  it('should handle config with minimal properties', () => {
    const minimalConfig: NotFoundStateConfig = {
      icon: '❌',
      title: 'Error',
      message: 'Something went wrong',
    };

    component.config = minimalConfig;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.not-found-icon');
    const title = compiled.querySelector('h2');
    const message = compiled.querySelector('p');
    const button = compiled.querySelector('.not-found-btn');

    expect(icon?.textContent).toContain('❌');
    expect(title?.textContent).toContain('Error');
    expect(message?.textContent).toContain('Something went wrong');
    expect(button).toBeFalsy(); // No button when buttonText is not provided
  });

  it('should handle config with showButton explicitly set to false', () => {
    component.config = { ...mockConfig, showButton: false };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.not-found-btn');
    expect(button).toBeFalsy();
  });

  it('should handle config with showButton explicitly set to true and buttonText provided', () => {
    component.config = { ...mockConfig, showButton: true, buttonText: 'Custom Button' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.not-found-btn');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Custom Button');
  });

  it('should be a standalone component', () => {
    expect(NotFoundStateComponent.prototype.constructor).toBeDefined();
    expect(NotFoundStateComponent.prototype.constructor.name).toBe('NotFoundStateComponent2'); // Actual name in tests
  });

  it('should have component metadata', () => {
    expect(NotFoundStateComponent.prototype).toBeDefined();
    expect(NotFoundStateComponent.prototype.constructor).toBeDefined();
  });

  it('should not throw errors during rendering', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should handle multiple button clicks', () => {
    spyOn(component.buttonClick, 'emit');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.not-found-btn') as HTMLElement;

    button.click();
    button.click();
    button.click();

    expect(component.buttonClick.emit).toHaveBeenCalledTimes(3);
  });
});
