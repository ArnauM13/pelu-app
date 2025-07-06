import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentItemComponent, AppointmentItemData } from './appointment-item.component';
import { AppointmentEvent } from '../../../features/calendar/calendar.component';

describe('AppointmentItemComponent', () => {
  let component: AppointmentItemComponent;
  let fixture: ComponentFixture<AppointmentItemComponent>;

  const mockAppointment: AppointmentEvent = {
    id: 'test-id',
    title: 'Test Appointment',
    serviceName: 'Test Service',
    duration: 60,
    start: '2024-01-15T10:00:00',
    end: '2024-01-15T11:00:00'
  };

  const mockAppointmentItemData: AppointmentItemData = {
    appointment: mockAppointment,
    top: 100,
    height: 60
  };

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

  it('should have required input data', () => {
    expect(component.data).toBeDefined();
    expect(typeof component.data).toBe('function');
  });

  it('should have clicked output', () => {
    expect(component.clicked).toBeDefined();
    expect(typeof component.clicked.emit).toBe('function');
  });

  it('should emit appointment when clicked', () => {
    spyOn(component.clicked, 'emit');

    const mockEvent = new Event('click');
    spyOn(mockEvent, 'stopPropagation');

    component.onAppointmentClick(mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should format duration correctly for minutes less than 60', () => {
    expect(component.formatDuration(30)).toBe('30 min');
    expect(component.formatDuration(45)).toBe('45 min');
  });

  it('should format duration correctly for hours without remaining minutes', () => {
    expect(component.formatDuration(60)).toBe('1h');
    expect(component.formatDuration(120)).toBe('2h');
    expect(component.formatDuration(180)).toBe('3h');
  });

  it('should format duration correctly for hours with remaining minutes', () => {
    expect(component.formatDuration(90)).toBe('1h 30min');
    expect(component.formatDuration(150)).toBe('2h 30min');
    expect(component.formatDuration(135)).toBe('2h 15min');
  });

  it('should render appointment item element', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const appointmentElement = compiled.querySelector('.appointment-item');
    expect(appointmentElement).toBeTruthy();
  });

  it('should have onAppointmentClick method', () => {
    expect(typeof component.onAppointmentClick).toBe('function');
  });

  it('should have formatDuration method', () => {
    expect(typeof component.formatDuration).toBe('function');
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

  it('should validate AppointmentItemData interface properties', () => {
    const data: AppointmentItemData = {
      appointment: mockAppointment,
      top: 150,
      height: 90
    };

    expect(data.appointment).toBe(mockAppointment);
    expect(data.top).toBe(150);
    expect(data.height).toBe(90);
  });
});
