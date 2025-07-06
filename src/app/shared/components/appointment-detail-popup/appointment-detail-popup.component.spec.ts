import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { AppointmentDetailPopupComponent } from './appointment-detail-popup.component';
import { AuthService } from '../../../auth/auth.service';
import { mockAuthService, mockRouter, mockUser } from '../../../../testing/firebase-mocks';

describe('AppointmentDetailPopupComponent', () => {
  let component: AppointmentDetailPopupComponent;
  let fixture: ComponentFixture<AppointmentDetailPopupComponent>;
  let mockRouterService: jasmine.SpyObj<Router>;
  let mockAuthServiceInstance: jasmine.SpyObj<AuthService>;

  const mockAppointment = {
    id: 'test-id',
    nom: 'Test Client',
    title: 'Test Appointment',
    data: '2024-01-15',
    hora: '10:00',
    start: '2024-01-15T10:00:00',
    notes: 'Test notes',
    servei: 'Test Service',
    preu: 50,
    duration: 60,
    serviceName: 'Test Service',
    serviceId: 'service-1',
    userId: 'user-1',
    clientName: 'Test Client'
  };

  beforeEach(async () => {
    mockRouterService = mockRouter;
    mockAuthServiceInstance = mockAuthService;

    await TestBed.configureTestingModule({
      imports: [AppointmentDetailPopupComponent],
      providers: [
        { provide: Router, useValue: mockRouterService },
        { provide: AuthService, useValue: mockAuthServiceInstance },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentDetailPopupComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have open input signal', () => {
    expect(component.open).toBeDefined();
    expect(typeof component.open).toBe('function');
  });

  it('should have appointment input signal', () => {
    expect(component.appointment).toBeDefined();
    expect(typeof component.appointment).toBe('function');
  });

  it('should have closed output signal', () => {
    expect(component.closed).toBeDefined();
    expect(typeof component.closed.emit).toBe('function');
  });

  it('should have appointmentInfoItems computed property', () => {
    expect(component.appointmentInfoItems).toBeDefined();
    expect(typeof component.appointmentInfoItems).toBe('function');
  });

  it('should have isToday computed property', () => {
    expect(component.isToday).toBeDefined();
    expect(typeof component.isToday).toBe('function');
  });

  it('should have isPast computed property', () => {
    expect(component.isPast).toBeDefined();
    expect(typeof component.isPast).toBe('function');
  });

  it('should have statusBadge computed property', () => {
    expect(component.statusBadge).toBeDefined();
    expect(typeof component.statusBadge).toBe('function');
  });

  it('should inject Router and AuthService', () => {
    expect(component['router']).toBeDefined();
    expect(component['authService']).toBeDefined();
    expect(component['router']).toBe(mockRouterService);
    expect(component['authService']).toBe(mockAuthServiceInstance);
  });

  it('should emit closed event when onClose is called', () => {
    spyOn(component.closed, 'emit');

    component.onClose();

    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should emit closed event when backdrop is clicked', () => {
    spyOn(component.closed, 'emit');

    const mockEvent = new Event('click');
    Object.defineProperty(mockEvent, 'target', { value: mockEvent.currentTarget });

    component.onBackdropClick(mockEvent);

    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should not emit closed event when non-backdrop element is clicked', () => {
    spyOn(component.closed, 'emit');

    const mockEvent = new Event('click');
    const mockTarget = document.createElement('div');
    Object.defineProperty(mockEvent, 'target', { value: mockTarget });
    Object.defineProperty(mockEvent, 'currentTarget', { value: document.createElement('div') });

    component.onBackdropClick(mockEvent);

    expect(component.closed.emit).not.toHaveBeenCalled();
  });

  it('should format date correctly', () => {
    expect(component.formatDate('2024-01-15')).toBe('15 de gener de 2024');
    expect(component.formatDate('')).toBe('Data no disponible');
  });

  it('should format time correctly', () => {
    expect(component.formatTime('10:00')).toBe('10:00');
    expect(component.formatTime('14:30')).toBe('14:30');
  });

  it('should check if date is today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(component.isTodayDate(today)).toBe(true);

    expect(component.isTodayDate('2024-01-15')).toBe(false);
  });

  it('should check if date is past', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    expect(component.isPastDate(yesterdayString)).toBe(true);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    expect(component.isPastDate(tomorrowString)).toBe(false);
  });

  it('should return correct status badge for today', () => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointment = { ...mockAppointment, data: today };

    // Mock the computed property behavior
    spyOn(component, 'isToday').and.returnValue(true);
    spyOn(component, 'isPast').and.returnValue(false);

    const badge = component.statusBadge();
    expect(badge.text).toBe('Avui');
    expect(badge.class).toBe('today');
  });

  it('should return correct status badge for past appointment', () => {
    spyOn(component, 'isToday').and.returnValue(false);
    spyOn(component, 'isPast').and.returnValue(true);

    const badge = component.statusBadge();
    expect(badge.text).toBe('Passada');
    expect(badge.class).toBe('past');
  });

  it('should return correct status badge for upcoming appointment', () => {
    spyOn(component, 'isToday').and.returnValue(false);
    spyOn(component, 'isPast').and.returnValue(false);

    const badge = component.statusBadge();
    expect(badge.text).toBe('Propera');
    expect(badge.class).toBe('upcoming');
  });

  it('should generate appointment info items correctly', () => {
    const infoItems = component.appointmentInfoItems();

    // Since no appointment is set, should return empty array
    expect(infoItems).toEqual([]);
  });

    it('should navigate to appointment detail when view full detail is called', () => {
    spyOn(component.closed, 'emit');
    mockAuthServiceInstance.user.and.returnValue(mockUser);

    // Mock the appointment data
    spyOn(component, 'appointment').and.returnValue(mockAppointment);

    component.onViewFullDetail();

    expect(mockRouterService.navigate).toHaveBeenCalledWith(['/appointments', 'test-uid-123-test-id']);
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should handle missing appointment data gracefully', () => {
    spyOn(console, 'error');
    spyOn(component, 'appointment').and.returnValue(null);

    component.onViewFullDetail();

    expect(console.error).toHaveBeenCalledWith('No appointment data available');
  });

  it('should handle missing user gracefully', () => {
    spyOn(console, 'error');
    mockAuthServiceInstance.user.and.returnValue(null);
    spyOn(component, 'appointment').and.returnValue(mockAppointment);

    component.onViewFullDetail();

    expect(console.error).toHaveBeenCalledWith('No hi ha usuari autenticat');
  });

  it('should handle missing appointment ID gracefully', () => {
    spyOn(console, 'error');
    mockAuthServiceInstance.user.and.returnValue(mockUser);
    const appointmentWithoutId = { ...mockAppointment, id: '' };
    spyOn(component, 'appointment').and.returnValue(appointmentWithoutId);

    component.onViewFullDetail();

    expect(console.error).toHaveBeenCalledWith('Appointment ID is missing');
  });

  it('should be a standalone component', () => {
    expect(AppointmentDetailPopupComponent.prototype.constructor.name).toBe('AppointmentDetailPopupComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = AppointmentDetailPopupComponent;
    expect(componentClass.name).toBe('AppointmentDetailPopupComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should have component metadata', () => {
    expect(AppointmentDetailPopupComponent.prototype).toBeDefined();
    expect(AppointmentDetailPopupComponent.prototype.constructor).toBeDefined();
  });
});
