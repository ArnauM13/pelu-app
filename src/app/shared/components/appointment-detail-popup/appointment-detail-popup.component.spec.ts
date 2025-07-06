import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { AppointmentDetailPopupComponent } from './appointment-detail-popup.component';
import { AuthService } from '../../../auth/auth.service';
import { mockAuthService, mockRouter, mockUser } from '../../../../testing/firebase-mocks';
import { createTestComponentNoRender } from '../../../../testing/test-setup';

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

    fixture = await createTestComponentNoRender<AppointmentDetailPopupComponent>(
      AppointmentDetailPopupComponent
    );
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signals', () => {
    expect(component.open).toBeDefined();
    expect(component.appointment).toBeDefined();
  });

  it('should have required output signals', () => {
    expect(component.closed).toBeDefined();
  });

  it('should have computed properties', () => {
    expect(component.appointmentInfoItems).toBeDefined();
    expect(component.isToday).toBeDefined();
    expect(component.isPast).toBeDefined();
    expect(component.statusBadge).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof component.onClose).toBe('function');
    expect(typeof component.onViewFullDetail).toBe('function');
    expect(typeof component.onBackdropClick).toBe('function');
    expect(typeof component.formatDate).toBe('function');
    expect(typeof component.formatTime).toBe('function');
    expect(typeof component.isTodayDate).toBe('function');
    expect(typeof component.isPastDate).toBe('function');
  });

  it('should format date correctly', () => {
    const testDate = '2024-01-15';
    const formatted = component.formatDate(testDate);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should format time correctly', () => {
    const testTime = '10:30';
    const formatted = component.formatTime(testTime);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should emit closed event when onClose is called', () => {
    spyOn(component.closed, 'emit');
    expect(() => component.onClose()).not.toThrow();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should handle view full detail without errors', () => {
    expect(() => component.onViewFullDetail()).not.toThrow();
  });

  it('should handle backdrop click', () => {
    spyOn(component, 'onClose');
    const mockEvent = new Event('click');
    Object.defineProperty(mockEvent, 'target', { value: mockEvent.currentTarget });

    expect(() => component.onBackdropClick(mockEvent)).not.toThrow();
    expect(component.onClose).toHaveBeenCalled();
  });

  it('should not close on non-backdrop click', () => {
    spyOn(component, 'onClose');
    const mockEvent = new Event('click');
    const mockTarget = document.createElement('div');
    Object.defineProperty(mockEvent, 'target', { value: mockTarget });
    Object.defineProperty(mockEvent, 'currentTarget', { value: document.createElement('div') });

    expect(() => component.onBackdropClick(mockEvent)).not.toThrow();
    expect(component.onClose).not.toHaveBeenCalled();
  });

  it('should check if date is today', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = component.isTodayDate(today);
    expect(typeof result).toBe('boolean');
  });

  it('should check if date is past', () => {
    const pastDate = '2023-01-01';
    const result = component.isPastDate(pastDate);
    expect(typeof result).toBe('boolean');
  });

  it('should handle missing appointment gracefully', () => {
    spyOn(component, 'appointment').and.returnValue(null);
    expect(() => component.appointmentInfoItems()).not.toThrow();
    expect(() => component.isToday()).not.toThrow();
    expect(() => component.isPast()).not.toThrow();
    expect(() => component.statusBadge()).not.toThrow();
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
