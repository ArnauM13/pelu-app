import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';
import { AuthService } from '../auth/auth.service';
import { RoleService } from './role.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoggerService } from '../../shared/services/logger.service';
import { BookingValidationService } from './booking-validation.service';
import { HybridEmailService } from './hybrid-email.service';
import { LoaderService } from '../../shared/services/loader.service';
import { Firestore } from '@angular/fire/firestore';
import { configureTestBed } from '../../../testing/test-setup';

describe('BookingService', () => {
  let service: BookingService;
  let authService: jasmine.SpyObj<AuthService>;
  let roleService: jasmine.SpyObj<RoleService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let loggerService: jasmine.SpyObj<LoggerService>;
  let bookingValidationService: jasmine.SpyObj<BookingValidationService>;
  let emailService: jasmine.SpyObj<HybridEmailService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let firestore: jasmine.SpyObj<Firestore>;

  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User'
  };

  const mockBookingData = {
    clientName: 'John Doe',
    email: 'john@example.com',
    data: '2024-01-15',
    hora: '10:00',
    notes: 'Test booking',
    serviceId: 'service-1',
    status: 'confirmed' as const
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['user', 'isAuthenticated', 'isInitialized'], {
      user: mockUser,
      isAuthenticated: true,
      isInitialized: true
    });

    const roleSpy = jasmine.createSpyObj('RoleService', [], {
      isAdmin: false
    });

    const toastSpy = jasmine.createSpyObj('ToastService', [
      'showAppointmentCreated',
      'showGenericError'
    ]);

    const loggerSpy = jasmine.createSpyObj('LoggerService', [
      'firebaseError'
    ]);

    const validationSpy = jasmine.createSpyObj('BookingValidationService', [
      'canBookAppointment'
    ]);

    const emailSpy = jasmine.createSpyObj('HybridEmailService', [
      'sendBookingConfirmationEmail'
    ]);

    const loaderSpy = jasmine.createSpyObj('LoaderService', [
      'show',
      'hide'
    ]);

    const firestoreSpy = jasmine.createSpyObj('Firestore', []);

    await configureTestBed([], [
      BookingService,
      { provide: AuthService, useValue: authSpy },
      { provide: RoleService, useValue: roleSpy },
      { provide: ToastService, useValue: toastSpy },
      { provide: LoggerService, useValue: loggerSpy },
      { provide: BookingValidationService, useValue: validationSpy },
      { provide: HybridEmailService, useValue: emailSpy },
      { provide: LoaderService, useValue: loaderSpy },
      { provide: Firestore, useValue: firestoreSpy }
    ]);

    service = TestBed.inject(BookingService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    roleService = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    loggerService = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
    bookingValidationService = TestBed.inject(BookingValidationService) as jasmine.SpyObj<BookingValidationService>;
    emailService = TestBed.inject(HybridEmailService) as jasmine.SpyObj<HybridEmailService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    firestore = TestBed.inject(Firestore) as jasmine.SpyObj<Firestore>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Loader Integration', () => {
    it('should inject LoaderService correctly', () => {
      expect(loaderService).toBeDefined();
      expect(loaderService.show).toBeDefined();
      expect(loaderService.hide).toBeDefined();
    });

    it('should show loader when creating booking', async () => {
      // Arrange
      bookingValidationService.canBookAppointment.and.returnValue(true);

      // Act
      await service.createBooking(mockBookingData);

      // Assert
      expect(loaderService.show).toHaveBeenCalledWith({
        message: 'BOOKING.CREATING_BOOKING'
      });
    });

    it('should hide loader after successful booking creation', async () => {
      // Arrange
      bookingValidationService.canBookAppointment.and.returnValue(true);

      // Act
      await service.createBooking(mockBookingData);

      // Assert
      expect(loaderService.hide).toHaveBeenCalled();
    });

    it('should hide loader after failed booking creation', async () => {
      // Arrange
      bookingValidationService.canBookAppointment.and.returnValue(false);

      // Act
      await service.createBooking(mockBookingData);

      // Assert
      expect(loaderService.hide).toHaveBeenCalled();
    });

    it('should hide loader when authentication fails', async () => {
      // Arrange
      authService.user.and.returnValue(null);

      // Act
      await service.createBooking(mockBookingData);

      // Assert
      expect(loaderService.hide).toHaveBeenCalled();
    });

    it('should use correct loader message for booking creation', async () => {
      // Arrange
      bookingValidationService.canBookAppointment.and.returnValue(true);

      // Act
      await service.createBooking(mockBookingData);

      // Assert
      expect(loaderService.show).toHaveBeenCalledWith({
        message: 'BOOKING.CREATING_BOOKING'
      });
    });

    it('should ensure loader is always hidden in finally block', async () => {
      // Arrange
      bookingValidationService.canBookAppointment.and.returnValue(true);
      let hideCallCount = 0;
      loaderService.hide.and.callFake(() => {
        hideCallCount++;
      });

      // Act
      await service.createBooking(mockBookingData);

      // Assert
      expect(hideCallCount).toBe(1);
    });
  });

  describe('Error Handling with Loader', () => {
    it('should hide loader when validation throws error', async () => {
      // Arrange
      bookingValidationService.canBookAppointment.and.throwError('Validation error');

      // Act
      await service.createBooking(mockBookingData);

      // Assert
      expect(loaderService.hide).toHaveBeenCalled();
    });

    it('should hide loader when authentication is missing', async () => {
      // Arrange
      authService.user.and.returnValue(null);

      // Act
      await service.createBooking(mockBookingData);

      // Assert
      expect(loaderService.hide).toHaveBeenCalled();
    });
  });

  describe('Service Integration', () => {
    it('should properly inject all required services', () => {
      expect(authService).toBeDefined();
      expect(roleService).toBeDefined();
      expect(toastService).toBeDefined();
      expect(loggerService).toBeDefined();
      expect(bookingValidationService).toBeDefined();
      expect(emailService).toBeDefined();
      expect(loaderService).toBeDefined();
      expect(firestore).toBeDefined();
    });

    it('should have proper signal-based properties', () => {
      expect(service.bookings).toBeDefined();
      expect(service.isLoading).toBeDefined();
      expect(service.error).toBeDefined();
      expect(service.isInitialized).toBeDefined();
      expect(service.isAdmin).toBeDefined();
      expect(service.hasCachedData).toBeDefined();
    });
  });
});
