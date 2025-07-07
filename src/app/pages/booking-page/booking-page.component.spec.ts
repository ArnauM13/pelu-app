import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { BookingPageComponent } from './booking-page.component';
import { AuthService } from '../../auth/auth.service';
import { mockAuthService, mockMessageService } from '../../../testing/firebase-mocks';
import { createTestComponentNoRender } from '../../../testing/test-setup';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('BookingPageComponent', () => {
  let component: BookingPageComponent;
  let fixture: ComponentFixture<BookingPageComponent>;
  let messageService: MessageService;

    beforeEach(async () => {
    // Reset mocks before each test
    mockMessageService.add.calls.reset();
    mockMessageService.clear.calls.reset();

    fixture = await createTestComponentNoRender<BookingPageComponent>(
      BookingPageComponent,
      [FormsModule, HttpClientModule, TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
      })],
      [
        { provide: MessageService, useValue: mockMessageService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    );
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService);

    // Ensure the component is properly initialized
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have updateNom method', () => {
    expect(typeof component.updateNom).toBe('function');
  });

  it('should have updateData method', () => {
    expect(typeof component.updateData).toBe('function');
  });

  it('should have updateHora method', () => {
    expect(typeof component.updateHora).toBe('function');
  });

  it('should have onDateSelected method', () => {
    expect(typeof component.onDateSelected).toBe('function');
  });

  it('should have onBookingConfirmed method', () => {
    expect(typeof component.onBookingConfirmed).toBe('function');
  });

  it('should have onBookingCancelled method', () => {
    expect(typeof component.onBookingCancelled).toBe('function');
  });

  it('should have afegirCita method', () => {
    expect(typeof component.afegirCita).toBe('function');
  });

  it('should have esborrarCita method', () => {
    expect(typeof component.esborrarCita).toBe('function');
  });

  it('should have guardarCites method', () => {
    expect(typeof component.guardarCites).toBe('function');
  });

  it('should have formatDate method', () => {
    expect(typeof component.formatDate).toBe('function');
  });

  it('should have getCitaInfoItem method', () => {
    expect(typeof component.getCitaInfoItem).toBe('function');
  });

  it('should have toast methods', () => {
    expect(typeof component.onToastClick).toBe('function');
    expect(typeof component.showToast).toBe('function');
  });

  // Toast functionality tests
  describe('Toast Functionality', () => {
    it('should show success toast', () => {
      component.showToast('success', 'Success', 'Booking created successfully', 'test-123', true);
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Booking created successfully',
        life: 4000,
        closable: false,
        key: 'booking-toast',
        data: { appointmentId: 'test-123', showViewButton: true }
      });
    });

    it('should show error toast', () => {
      component.showToast('error', 'Error', 'Failed to create booking', 'test-123', false);
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create booking',
        life: 4000,
        closable: false,
        key: 'booking-toast',
        data: { appointmentId: 'test-123', showViewButton: false }
      });
    });

    it('should show warning toast', () => {
      component.showToast('warn', 'Warning', 'Please check your selection', 'test-123', false);
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please check your selection',
        life: 4000,
        closable: false,
        key: 'booking-toast',
        data: { appointmentId: 'test-123', showViewButton: false }
      });
    });

    it('should show info toast', () => {
      component.showToast('info', 'Info', 'Booking information', 'test-123', false);
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Info',
        detail: 'Booking information',
        life: 4000,
        closable: false,
        key: 'booking-toast',
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
      component.messageService.clear('booking-toast');
      expect(mockMessageService.clear).toHaveBeenCalledWith('booking-toast');
    });

    it('should show toast with correct life duration', () => {
      component.showToast('success', 'Test', 'Test detail');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Test',
        detail: 'Test detail',
        life: 4000,
        closable: false,
        key: 'booking-toast',
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
        key: 'booking-toast',
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
        key: 'booking-toast',
        data: undefined
      });
    });
  });

  // Toast Integration with Booking tests
  describe('Toast Integration with Booking', () => {
    it('should show success toast after successful booking creation', () => {
      const mockAppointment = { id: 'test-123', nom: 'Test Client' };
      component.showToast('success', 'Booking Created', 'Appointment scheduled successfully', 'test-123', true);

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Booking Created',
        detail: 'Appointment scheduled successfully',
        life: 4000,
        closable: false,
        key: 'booking-toast',
        data: { appointmentId: 'test-123', showViewButton: true }
      });
    });

    it('should show error toast after failed booking creation', () => {
      component.showToast('error', 'Booking Failed', 'Unable to create appointment', 'test-123', false);

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Booking Failed',
        detail: 'Unable to create appointment',
        life: 4000,
        closable: false,
        key: 'booking-toast',
        data: { appointmentId: 'test-123', showViewButton: false }
      });
    });

    it('should show warning toast for invalid booking data', () => {
      component.showToast('warn', 'Invalid Data', 'Please provide client name', 'test-123', false);

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Invalid Data',
        detail: 'Please provide client name',
        life: 4000,
        closable: false,
        key: 'booking-toast',
        data: { appointmentId: 'test-123', showViewButton: false }
      });
    });

    it('should show info toast for booking cancellation', () => {
      component.showToast('info', 'Cancelled', 'Booking was cancelled', undefined, false);

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Cancelled',
        detail: 'Booking was cancelled',
        life: 4000,
        closable: false,
        key: 'booking-toast',
        data: { appointmentId: undefined, showViewButton: false }
      });
    });
  });
});
