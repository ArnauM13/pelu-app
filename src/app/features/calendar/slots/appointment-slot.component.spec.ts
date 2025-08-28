import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentSlotComponent, AppointmentSlotData } from './appointment-slot.component';
import { CalendarCoreService } from '../services/calendar-core.service';
import { AppointmentEvent } from '../core/calendar.component';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { ServicesService } from '../../../core/services/services.service';
import { UserService } from '../../../core/services/user.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { provideMockFirebase } from '../../../../testing/firebase-mocks';

describe('AppointmentSlotComponent', () => {
  let component: AppointmentSlotComponent;
  let fixture: ComponentFixture<AppointmentSlotComponent>;
  let mockCalendarCoreService: jasmine.SpyObj<CalendarCoreService>;
  let mockServiceColorsService: jasmine.SpyObj<ServiceColorsService>;
  let mockServicesService: jasmine.SpyObj<ServicesService>;
  let mockUserService: jasmine.SpyObj<UserService>;

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
    const coreSpy = jasmine.createSpyObj('CalendarCoreService', ['calculateReactiveAppointmentPosition']);
    const colorsSpy = jasmine.createSpyObj('ServiceColorsService', [
      'getServiceColor',
      'getDefaultColor',
    ]);
    const servicesSpy = jasmine.createSpyObj('ServicesService', [
      'getAllServices',
      'getServiceCssClass',
      'getServiceTextCssClass',
    ]);
    const userSpy = jasmine.createSpyObj('UserService', ['isAdmin']);

    await TestBed.configureTestingModule({
      imports: [
        AppointmentSlotComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: class MockTranslateLoader implements TranslateLoader {
            getTranslation() { return of({}); }
          }}
        })
      ],
      providers: [
        { provide: CalendarCoreService, useValue: coreSpy },
        { provide: ServiceColorsService, useValue: colorsSpy },
        { provide: ServicesService, useValue: servicesSpy },
        { provide: UserService, useValue: userSpy },
        provideMockFirebase(),
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
    mockServicesService = TestBed.inject(
      ServicesService
    ) as jasmine.SpyObj<ServicesService>;
    mockUserService = TestBed.inject(
      UserService
    ) as jasmine.SpyObj<UserService>;

    // Setup default spy returns
    mockCalendarCoreService.calculateReactiveAppointmentPosition.and.returnValue({ top: 100, height: 60 });
    mockServiceColorsService.getServiceColor.and.returnValue({ color: '#3b82f6' } as any);
    mockServiceColorsService.getDefaultColor.and.returnValue({ color: '#6b7280' } as any);
    mockServicesService.getAllServices.and.returnValue([]);
    mockServicesService.getServiceCssClass.and.returnValue('service-color-default');
    mockServicesService.getServiceTextCssClass.and.returnValue('service-text-default');
    mockUserService.isAdmin.and.returnValue(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    // The data input is required, so it will throw an error if not set
    expect(() => component.data()).toThrow();
  });

  it('should format duration correctly', () => {
    expect(component.formatDuration(60)).toBe('1h');
    expect(component.formatDuration(90)).toBe('1h 30min');
    expect(component.formatDuration(30)).toBe('30 min');
  });

  it('should have computed position', () => {
    // Set data by creating a new component instance with the data
    const testFixture = TestBed.createComponent(AppointmentSlotComponent);
    const testComponent = testFixture.componentInstance;

    // Set the input data using componentRef.setInput
    testFixture.componentRef.setInput('data', mockSlotData);
    const position = testComponent.position();

    expect(position).toEqual({ top: 100, height: 60 });
    expect(mockCalendarCoreService.calculateReactiveAppointmentPosition).toHaveBeenCalledWith(
      mockAppointmentEvent
    );
  });

  // serviceColor getter removed in component; color handled via servicesService within CSS class

  it('should handle missing data gracefully', () => {
    // Set data by creating a new component instance with null data
    const testFixture = TestBed.createComponent(AppointmentSlotComponent);
    const testComponent = testFixture.componentInstance;

    // Set the input data to null using componentRef.setInput
    testFixture.componentRef.setInput('data', null);
    const position = testComponent.position();

    expect(position).toEqual({ top: 0, height: 0 });
  });
});
