import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { InputsDemoComponent } from './inputs-demo.component';

describe('InputsDemoComponent', () => {
  let component: InputsDemoComponent;
  let fixture: ComponentFixture<InputsDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputsDemoComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(InputsDemoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have formData signal defined', () => {
    expect(component.formData).toBeDefined();
    expect(typeof component.formData).toBe('function');
  });

  it('should have computed properties defined', () => {
    expect(component.popularServicesCount).toBeDefined();
    expect(component.averageDuration).toBeDefined();
    expect(component.averagePrice).toBeDefined();
  });

  it('should have updateField method defined', () => {
    expect(typeof component.updateField).toBe('function');
  });

  it('should have categoryOptions array defined', () => {
    expect(component.categoryOptions).toBeDefined();
    expect(Array.isArray(component.categoryOptions)).toBe(true);
    expect(component.categoryOptions.length).toBe(3);
  });

  it('should have serviceOptions array defined', () => {
    expect(component.serviceOptions).toBeDefined();
    expect(Array.isArray(component.serviceOptions)).toBe(true);
    expect(component.serviceOptions.length).toBe(6);
  });

  it('should initialize formData with default values', () => {
    const formData = component.formData();
    expect(formData.name).toBe('');
    expect(formData.email).toBe('');
    expect(formData.password).toBe('');
    expect(formData.description).toBe('');
    expect(formData.age).toBe(null);
    expect(formData.birthDate).toBe(null);
    expect(formData.appointmentDate).toBe(null);
    expect(formData.appointmentTime).toBe(null);
    expect(formData.terms).toBe(false);
    expect(formData.category).toBe('');
    expect(formData.service).toBe('');
    expect(formData.selectedServices).toEqual([]);
    expect(formData.notes).toBe('');
  });

  it('should have demoDate and inlineDate initialized with current date', () => {
    const formData = component.formData();
    expect(formData.demoDate).toBeInstanceOf(Date);
    expect(formData.inlineDate).toBeInstanceOf(Date);
  });

  it('should calculate popular services count correctly', () => {
    const popularCount = component.popularServicesCount();
    const expectedCount = component.serviceOptions.filter(service => service.isPopular).length;
    expect(popularCount).toBe(expectedCount);
    expect(popularCount).toBe(3); // Based on the service options in the component
  });

  it('should calculate average duration correctly', () => {
    const averageDuration = component.averageDuration();
    const totalDuration = component.serviceOptions.reduce((sum, service) => sum + service.duration, 0);
    const expectedAverage = Math.round(totalDuration / component.serviceOptions.length);
    expect(averageDuration).toBe(expectedAverage);
    expect(averageDuration).toBe(62); // Based on the service options in the component
  });

  it('should calculate average price correctly', () => {
    const averagePrice = component.averagePrice();
    const totalPrice = component.serviceOptions.reduce((sum, service) => sum + service.price, 0);
    const expectedAverage = Math.round(totalPrice / component.serviceOptions.length);
    expect(averagePrice).toBe(expectedAverage);
    expect(averagePrice).toBe(43); // Based on the service options in the component
  });

  it('should update form field correctly', () => {
    const initialName = component.formData().name;
    expect(initialName).toBe('');

    component.updateField('name', 'John Doe');
    expect(component.formData().name).toBe('John Doe');
  });

  it('should update multiple form fields correctly', () => {
    component.updateField('name', 'Jane Smith');
    component.updateField('email', 'jane@example.com');
    component.updateField('age', 25 as any);

    const formData = component.formData();
    expect(formData.name).toBe('Jane Smith');
    expect(formData.email).toBe('jane@example.com');
    expect(formData.age).toBe(25 as any);
  });

  it('should update boolean fields correctly', () => {
    expect(component.formData().terms).toBe(false);
    
    component.updateField('terms', true);
    expect(component.formData().terms).toBe(true);
  });

  it('should update array fields correctly', () => {
    expect(component.formData().selectedServices).toEqual([]);
    
    component.updateField('selectedServices', ['service1', 'service2']);
    expect(component.formData().selectedServices).toEqual(['service1', 'service2']);
  });

  it('should have category options with correct structure', () => {
    const firstOption = component.categoryOptions[0];
    expect(firstOption.label).toBe('Opció 1');
    expect(firstOption.value).toBe('option1');
    expect(firstOption.color).toBe('#3b82f6');
  });

  it('should have service options with correct structure', () => {
    const firstService = component.serviceOptions[0];
    expect(firstService.label).toBe('Tall de Cabell');
    expect(firstService.value).toBe('haircut');
    expect(firstService.price).toBe(25);
    expect(firstService.duration).toBe(30);
    expect(firstService.isPopular).toBe(true);
    expect(firstService.available).toBe(true);
  });

  it('should be a standalone component', () => {
    expect(InputsDemoComponent.prototype.constructor).toBeDefined();
    expect(InputsDemoComponent.prototype.constructor.name).toContain('InputsDemoComponent');
  });

  it('should have component metadata', () => {
    expect(InputsDemoComponent.prototype).toBeDefined();
    expect(InputsDemoComponent.prototype.constructor).toBeDefined();
  });

  it('should not throw errors during rendering', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
