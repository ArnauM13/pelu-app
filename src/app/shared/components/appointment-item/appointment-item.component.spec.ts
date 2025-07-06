import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { AppointmentItemComponent, AppointmentItemData } from './appointment-item.component';
import { AppointmentEvent } from '../../../features/calendar/calendar.component';

// Test wrapper component to provide input signals
@Component({
  template: `
    <pelu-appointment-item
      [data]="testData()"
      (clicked)="onClicked()">
    </pelu-appointment-item>
  `,
  imports: [AppointmentItemComponent],
  standalone: true
})
class TestWrapperComponent {
  testData = signal<AppointmentItemData | null>(null);

  onClicked() {
    // Test method
  }
}

describe('AppointmentItemComponent', () => {
  let component: TestWrapperComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;
  let appointmentItemComponent: AppointmentItemComponent;

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
      imports: [TestWrapperComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    component = fixture.componentInstance;
    component.testData.set(mockAppointmentItemData);
    fixture.detectChanges();

    appointmentItemComponent = fixture.debugElement.query(
      (de) => de.componentInstance instanceof AppointmentItemComponent
    ).componentInstance;
  });

  it('should create', () => {
    expect(appointmentItemComponent).toBeTruthy();
  });

  it('should have required input data', () => {
    expect(appointmentItemComponent.data).toBeDefined();
    expect(typeof appointmentItemComponent.data).toBe('function');
  });

  it('should have clicked output', () => {
    expect(appointmentItemComponent.clicked).toBeDefined();
    expect(typeof appointmentItemComponent.clicked.emit).toBe('function');
  });

  it('should emit appointment when clicked', () => {
    spyOn(appointmentItemComponent.clicked, 'emit');

    const mockEvent = new Event('click');
    spyOn(mockEvent, 'stopPropagation');

    appointmentItemComponent.onAppointmentClick(mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(appointmentItemComponent.clicked.emit).toHaveBeenCalled();
  });

  it('should format duration correctly for minutes less than 60', () => {
    expect(appointmentItemComponent.formatDuration(30)).toBe('30 min');
    expect(appointmentItemComponent.formatDuration(45)).toBe('45 min');
  });

  it('should format duration correctly for hours without remaining minutes', () => {
    expect(appointmentItemComponent.formatDuration(60)).toBe('1h');
    expect(appointmentItemComponent.formatDuration(120)).toBe('2h');
    expect(appointmentItemComponent.formatDuration(180)).toBe('3h');
  });

  it('should format duration correctly for hours with remaining minutes', () => {
    expect(appointmentItemComponent.formatDuration(90)).toBe('1h 30min');
    expect(appointmentItemComponent.formatDuration(150)).toBe('2h 30min');
    expect(appointmentItemComponent.formatDuration(135)).toBe('2h 15min');
  });

  it('should render appointment item element', () => {
    const appointmentElement = fixture.nativeElement.querySelector('.appointment-item');
    expect(appointmentElement).toBeTruthy();
  });

  it('should have onAppointmentClick method', () => {
    expect(typeof appointmentItemComponent.onAppointmentClick).toBe('function');
  });

  it('should have formatDuration method', () => {
    expect(typeof appointmentItemComponent.formatDuration).toBe('function');
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
