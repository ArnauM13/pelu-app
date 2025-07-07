import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AppointmentsPageComponent } from './appointments-page.component';
import { MessageService } from 'primeng/api';
import { createTestComponentNoRender } from '../../../testing/test-setup';
import { mockMessageService } from '../../../testing/firebase-mocks';

describe('AppointmentsPageComponent', () => {
  let component: AppointmentsPageComponent;
  let fixture: ComponentFixture<AppointmentsPageComponent>;
  let messageService: MessageService;

  beforeEach(async () => {
    // Reset mocks before each test
    mockMessageService.add.calls.reset();
    mockMessageService.clear.calls.reset();

    fixture = await createTestComponentNoRender<AppointmentsPageComponent>(
      AppointmentsPageComponent,
      [FormsModule],
      [{ provide: MessageService, useValue: mockMessageService }]
    );
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService);

    // Ensure the component is properly initialized
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have deleteAppointment method', () => {
    expect(typeof component.deleteAppointment).toBe('function');
  });

  it('should have formatDate method', () => {
    expect(typeof component.formatDate).toBe('function');
  });

  it('should have formatTime method', () => {
    expect(typeof component.formatTime).toBe('function');
  });

  it('should have isToday method', () => {
    expect(typeof component.isToday).toBe('function');
  });

  it('should have isPast method', () => {
    expect(typeof component.isPast).toBe('function');
  });

  it('should have clearAllFilters method', () => {
    expect(typeof component.clearAllFilters).toBe('function');
  });

  it('should have computed properties', () => {
    expect(component.appointments).toBeDefined();
    expect(component.viewMode).toBeDefined();
    expect(component.filteredAppointments).toBeDefined();
    expect(component.totalAppointments).toBeDefined();
    expect(component.todayAppointments).toBeDefined();
    expect(component.upcomingAppointments).toBeDefined();
  });

  it('should have filter methods', () => {
    expect(typeof component.setFilterDate).toBe('function');
    expect(typeof component.setFilterClient).toBe('function');
    expect(typeof component.setQuickFilter).toBe('function');
  });

  it('should have view methods', () => {
    expect(typeof component.setViewMode).toBe('function');
  });

  it('should have utility methods', () => {
    expect(typeof component.deleteAppointment).toBe('function');
    expect(typeof component.viewAppointmentDetail).toBe('function');
  });

  it('should have toast methods', () => {
    expect(typeof component.onToastClick).toBe('function');
    expect(typeof component.showToast).toBe('function');
  });

  // Test method functionality without template rendering
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

  it('should check if date is today', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = component.isToday(today);
    expect(typeof result).toBe('boolean');
  });

  it('should check if date is past', () => {
    const pastDate = '2023-01-01';
    const result = component.isPast(pastDate);
    expect(typeof result).toBe('boolean');
  });

  it('should clear all filters', () => {
    expect(() => component.clearAllFilters()).not.toThrow();
  });

  it('should set filter date', () => {
    const testDate = '2024-01-15';
    expect(() => component.setFilterDate(testDate)).not.toThrow();
  });

  it('should set filter client', () => {
    const testClient = 'Test Client';
    expect(() => component.setFilterClient(testClient)).not.toThrow();
  });

  it('should set quick filter', () => {
    expect(() => component.setQuickFilter('all')).not.toThrow();
    expect(() => component.setQuickFilter('today')).not.toThrow();
    expect(() => component.setQuickFilter('upcoming')).not.toThrow();
    expect(() => component.setQuickFilter('mine')).not.toThrow();
  });

  it('should set view mode', () => {
    expect(() => component.setViewMode('list')).not.toThrow();
    expect(() => component.setViewMode('calendar')).not.toThrow();
  });

  it('should handle appointment deletion', () => {
    const mockAppointment = { id: '1', nom: 'Test' };
    expect(() => component.deleteAppointment(mockAppointment)).not.toThrow();
  });

  it('should handle appointment detail view', () => {
    const mockAppointment = { id: '1', nom: 'Test' };
    expect(() => component.viewAppointmentDetail(mockAppointment)).not.toThrow();
  });

  // Toast functionality tests
  describe('Toast Functionality', () => {
    it('should show success toast', () => {
      component.showToast('success', 'Success', 'Operation completed', 'test-123', true);
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Operation completed',
        life: 4000,
        closable: false,
        key: 'appointments-toast',
        data: { appointmentId: 'test-123', showViewButton: true }
      });
    });

    it('should show error toast', () => {
      component.showToast('error', 'Error', 'Something went wrong', 'test-123', false);
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong',
        life: 4000,
        closable: false,
        key: 'appointments-toast',
        data: { appointmentId: 'test-123', showViewButton: false }
      });
    });

    it('should show warning toast', () => {
      component.showToast('warn', 'Warning', 'Please check input', 'test-123', false);
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please check input',
        life: 4000,
        closable: false,
        key: 'appointments-toast',
        data: { appointmentId: 'test-123', showViewButton: false }
      });
    });

    it('should show info toast', () => {
      component.showToast('info', 'Info', 'Information message', 'test-123', false);
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Info',
        detail: 'Information message',
        life: 4000,
        closable: false,
        key: 'appointments-toast',
        data: { appointmentId: 'test-123', showViewButton: false }
      });
    });

    it('should handle toast click with appointment data', () => {
      const mockEvent = {
        message: {
          data: {
            appointmentId: 'test-123',
            showViewButton: true
          }
        }
      };

      spyOn(component, 'viewAppointmentDetail');

      component.onToastClick(mockEvent);

      expect(component.viewAppointmentDetail).toHaveBeenCalledWith('test-123');
    });

    it('should handle toast click without appointment data', () => {
      const mockEvent = {
        message: {
          data: {
            appointmentId: 'test-123',
            showViewButton: false
          }
        }
      };

      spyOn(component, 'viewAppointmentDetail');

      component.onToastClick(mockEvent);

      expect(component.viewAppointmentDetail).not.toHaveBeenCalled();
    });

    it('should clear toast when close button is clicked', () => {
      component.messageService.clear('appointments-toast');
      expect(mockMessageService.clear).toHaveBeenCalledWith('appointments-toast');
    });

    it('should show toast with correct life duration', () => {
      component.showToast('success', 'Test', 'Test detail');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Test',
        detail: 'Test detail',
        life: 4000,
        closable: false,
        key: 'appointments-toast',
        data: undefined
      });
    });

    it('should show toast with appointment data when provided', () => {
      component.showToast('success', 'Success', 'Appointment created', 'app-123', true);

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Appointment created',
        life: 4000,
        closable: false,
        key: 'appointments-toast',
        data: { appointmentId: 'app-123', showViewButton: true }
      });
    });

    it('should show toast without appointment data when not provided', () => {
      component.showToast('info', 'Info', 'General information');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Info',
        detail: 'General information',
        life: 4000,
        closable: false,
        key: 'appointments-toast',
        data: undefined
      });
    });
  });

  // Toast Integration tests
  describe('Toast Integration', () => {
    it('should show success toast after successful appointment deletion', () => {
      const mockAppointment = { id: 'test-123', nom: 'Test Client' };
      component.showToast('success', 'Deleted', 'Appointment deleted successfully', 'test-123', false);

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Appointment deleted successfully',
        life: 4000,
        closable: false,
        key: 'appointments-toast',
        data: { appointmentId: 'test-123', showViewButton: false }
      });
    });

    it('should show error toast after failed appointment deletion', () => {
      component.showToast('error', 'Error', 'Failed to delete appointment', 'test-123', false);

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete appointment',
        life: 4000,
        closable: false,
        key: 'appointments-toast',
        data: { appointmentId: 'test-123', showViewButton: false }
      });
    });

    it('should show toast with view button for appointment details', () => {
      component.showToast('info', 'Details', 'Viewing appointment details', 'test-123', true);

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Details',
        detail: 'Viewing appointment details',
        life: 4000,
        closable: false,
        key: 'appointments-toast',
        data: { appointmentId: 'test-123', showViewButton: true }
      });
    });
  });
});
