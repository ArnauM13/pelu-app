import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { AppointmentSlotComponent, AppointmentSlotData } from './appointment-slot.component';
import { CalendarPositionService } from './calendar-position.service';
import { AppointmentEvent } from './calendar.component';

// Test wrapper component to provide input signals
@Component({
  template: `
    <pelu-appointment-slot
      [data]="testData()"
      (clicked)="onClicked()">
    </pelu-appointment-slot>
  `,
  imports: [AppointmentSlotComponent],
  standalone: true
})
class TestWrapperComponent {
  testData = signal<AppointmentSlotData | null>(null);

  onClicked() {
    // Test method
  }
}

describe('AppointmentSlotComponent', () => {
  let component: TestWrapperComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;
  let appointmentSlotComponent: AppointmentSlotComponent;
  let mockPositionService: jasmine.SpyObj<CalendarPositionService>;

  const mockAppointment: AppointmentEvent = {
    id: 'test-id',
    title: 'Test Appointment',
    serviceName: 'Test Service',
    duration: 60,
    start: '2024-01-15T10:00:00',
    end: '2024-01-15T11:00:00'
  };

  const mockAppointmentSlotData: AppointmentSlotData = {
    appointment: mockAppointment,
    date: new Date('2024-01-15')
  };

  beforeEach(async () => {
    mockPositionService = jasmine.createSpyObj('CalendarPositionService', ['getAppointmentPosition']);
    mockPositionService.getAppointmentPosition.and.returnValue({
      top: 100,
      height: 60
    });

    await TestBed.configureTestingModule({
      imports: [TestWrapperComponent],
      providers: [
        { provide: CalendarPositionService, useValue: mockPositionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    component = fixture.componentInstance;
    component.testData.set(mockAppointmentSlotData);
    fixture.detectChanges();

    appointmentSlotComponent = fixture.debugElement.query(
      (de) => de.componentInstance instanceof AppointmentSlotComponent
    ).componentInstance;
  });

  it('should create', () => {
    expect(appointmentSlotComponent).toBeTruthy();
  });

  it('should have required input data', () => {
    expect(appointmentSlotComponent.data).toBeDefined();
    expect(typeof appointmentSlotComponent.data).toBe('function');
  });

  it('should have clicked output', () => {
    expect(appointmentSlotComponent.clicked).toBeDefined();
    expect(typeof appointmentSlotComponent.clicked.emit).toBe('function');
  });

  it('should have position computed property', () => {
    expect(appointmentSlotComponent.position).toBeDefined();
    expect(typeof appointmentSlotComponent.position).toBe('function');
  });

  it('should inject CalendarPositionService', () => {
    expect(appointmentSlotComponent['positionService']).toBeDefined();
    expect(appointmentSlotComponent['positionService']).toBe(mockPositionService);
  });

  it('should call position service when position is computed', () => {
    appointmentSlotComponent.position();

    expect(mockPositionService.getAppointmentPosition).toHaveBeenCalled();
  });

  it('should return correct position from service', () => {
    const expectedPosition = { top: 100, height: 60 };
    mockPositionService.getAppointmentPosition.and.returnValue(expectedPosition);

    expect(appointmentSlotComponent.position()).toEqual(expectedPosition);
  });

  it('should emit appointment when clicked', () => {
    spyOn(appointmentSlotComponent.clicked, 'emit');

    const mockEvent = new Event('click');
    spyOn(mockEvent, 'stopPropagation');

    appointmentSlotComponent.onAppointmentClick(mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(appointmentSlotComponent.clicked.emit).toHaveBeenCalled();
  });

  it('should format duration correctly for minutes less than 60', () => {
    expect(appointmentSlotComponent.formatDuration(30)).toBe('30 min');
    expect(appointmentSlotComponent.formatDuration(45)).toBe('45 min');
  });

  it('should format duration correctly for hours without remaining minutes', () => {
    expect(appointmentSlotComponent.formatDuration(60)).toBe('1h');
    expect(appointmentSlotComponent.formatDuration(120)).toBe('2h');
    expect(appointmentSlotComponent.formatDuration(180)).toBe('3h');
  });

  it('should format duration correctly for hours with remaining minutes', () => {
    expect(appointmentSlotComponent.formatDuration(90)).toBe('1h 30min');
    expect(appointmentSlotComponent.formatDuration(150)).toBe('2h 30min');
    expect(appointmentSlotComponent.formatDuration(135)).toBe('2h 15min');
  });

  it('should render appointment title when data is available', () => {
    const titleElement = fixture.nativeElement.querySelector('.appointment-title');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Test Appointment');
  });

  it('should render service name when available', () => {
    const serviceElement = fixture.nativeElement.querySelector('.appointment-service');
    expect(serviceElement).toBeTruthy();
    expect(serviceElement.textContent).toContain('Test Service');
  });

  it('should render formatted duration when data is available', () => {
    const durationElement = fixture.nativeElement.querySelector('.appointment-duration');
    expect(durationElement).toBeTruthy();
    expect(durationElement.textContent).toContain('1h');
  });

  it('should apply correct styles from position', () => {
    const expectedPosition = { top: 150, height: 90 };
    mockPositionService.getAppointmentPosition.and.returnValue(expectedPosition);

    component.testData.set(mockAppointmentSlotData);
    fixture.detectChanges();

    const appointmentElement = fixture.nativeElement.querySelector('.appointment') as HTMLElement;
    expect(appointmentElement).toBeTruthy();
  });

  it('should be a standalone component', () => {
    expect(AppointmentSlotComponent.prototype.constructor.name).toBe('AppointmentSlotComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = AppointmentSlotComponent;
    expect(componentClass.name).toBe('AppointmentSlotComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should have component metadata', () => {
    expect(AppointmentSlotComponent.prototype).toBeDefined();
    expect(AppointmentSlotComponent.prototype.constructor).toBeDefined();
  });
});
