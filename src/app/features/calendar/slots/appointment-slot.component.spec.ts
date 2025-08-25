import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentSlotComponent, AppointmentSlotData } from './appointment-slot.component';
import { CalendarCoreService } from '../services/calendar-core.service';
import { AppointmentEvent } from '../core/calendar.component';
import { ServiceColorsService } from '../../../core/services/service-colors.service';

describe('AppointmentSlotComponent', () => {
  let component: AppointmentSlotComponent;
  let fixture: ComponentFixture<AppointmentSlotComponent>;
  let mockCalendarCoreService: jasmine.SpyObj<CalendarCoreService>;
  let mockServiceColorsService: jasmine.SpyObj<ServiceColorsService>;

  const mockAppointmentEvent: AppointmentEvent = {
    id: 'test-1',
    title: 'Test Appointment',
    start: '2024-01-01T10:00:00',
    duration: 60,
    serviceName: 'Test Service',
    clientName: 'Test Client',
  };

  const mockSlotData: AppointmentSlotData = {
    appointment: mockAppointmentEvent,
    date: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const coreSpy = jasmine.createSpyObj('CalendarCoreService', ['calculateAppointmentPosition']);
    const colorsSpy = jasmine.createSpyObj('ServiceColorsService', [
      'getServiceColor',
      'getDefaultColor',
    ]);

    await TestBed.configureTestingModule({
      imports: [AppointmentSlotComponent],
      providers: [
        { provide: CalendarCoreService, useValue: coreSpy },
        { provide: ServiceColorsService, useValue: colorsSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentSlotComponent);
    component = fixture.componentInstance;
    mockCalendarCoreService = TestBed.inject(
      CalendarCoreService
    ) as jasmine.SpyObj<CalendarCoreService>;
    mockServiceColorsService = TestBed.inject(
      ServiceColorsService
    ) as jasmine.SpyObj<ServiceColorsService>;

    // Setup default spy returns
    mockCalendarCoreService.calculateAppointmentPosition.and.returnValue({ top: 100, height: 60 });
    mockServiceColorsService.getServiceColor.and.returnValue({ color: '#3b82f6' } as any);
    mockServiceColorsService.getDefaultColor.and.returnValue({ color: '#6b7280' } as any);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.data()).toBeUndefined();
  });

  it('should format duration correctly', () => {
    expect(component.formatDuration(60)).toBe('1h');
    expect(component.formatDuration(90)).toBe('1h 30m');
    expect(component.formatDuration(30)).toBe('30m');
  });

  it('should have computed position', () => {
    // Set data using writeSignal (Angular 17+ way)
    (component.data as any).set(mockSlotData);
    const position = component.position();

    expect(position).toEqual({ top: 100, height: 60 });
    expect(mockCalendarCoreService.calculateAppointmentPosition).toHaveBeenCalledWith(
      mockAppointmentEvent
    );
  });

  // serviceColor getter removed in component; color handled via servicesService within CSS class

  it('should handle missing data gracefully', () => {
    // Set data using writeSignal (Angular 17+ way)
    (component.data as any).set(null);

    const position = component.position();

    expect(position).toEqual({ top: 0, height: 0 });
  });
});
