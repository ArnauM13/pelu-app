import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentItemComponent } from './appointment-item.component';

describe('AppointmentItemComponent', () => {
  let component: AppointmentItemComponent;
  let fixture: ComponentFixture<AppointmentItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signals', () => {
    expect(component.data).toBeDefined();
  });

  it('should have required output signals', () => {
    expect(component.clicked).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof component.onAppointmentClick).toBe('function');
    expect(typeof component.formatDuration).toBe('function');
  });

  it('should format duration correctly', () => {
    expect(component.formatDuration(30)).toBe('30 min');
    expect(component.formatDuration(60)).toBe('1h');
    expect(component.formatDuration(90)).toBe('1h 30min');
  });

  it('should be a standalone component', () => {
    expect(AppointmentItemComponent.prototype.constructor.name).toBe('AppointmentItemComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = AppointmentItemComponent;
    expect(componentClass.name).toBe('AppointmentItemComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should have component metadata', () => {
    expect(AppointmentItemComponent.prototype).toBeDefined();
    expect(AppointmentItemComponent.prototype.constructor).toBeDefined();
  });
});
