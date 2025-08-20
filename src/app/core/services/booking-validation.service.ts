import { Injectable, inject } from '@angular/core';
import { SystemParametersService } from './system-parameters.service';
import { AuthService } from '../auth/auth.service';
import { Booking } from '../interfaces/booking.interface';
import { FirebaseServicesService } from './firebase-services.service';
import { TimeSlot } from '../../shared/utils/time.utils';

@Injectable({
  providedIn: 'root',
})
export class BookingValidationService {
  private readonly systemParametersService = inject(SystemParametersService);
  private readonly authService = inject(AuthService);
  private readonly firebaseServicesService = inject(FirebaseServicesService);

  /**
   * Validates if a booking can be made at the specified time
   */
  canBookAtTime(date: Date, time: string): boolean {
    const settings = this.systemParametersService.parameters();
    const [hour] = time.split(':').map(Number);
    const businessHours = settings.businessHours;

    // Check if time is within business hours
    if (hour < businessHours.start || hour >= businessHours.end) {
      return false;
    }

    // Check if time is during lunch break
    if (hour >= businessHours.lunchStart && hour < businessHours.lunchEnd) {
      return false;
    }

    return true;
  }



  /**
   * Validates if a booking can be made on the specified date
   */
  canBookOnDate(date: Date): boolean {
    const settings = this.systemParametersService.parameters();
    const dayOfWeek = date.getDay();
    const workingDays = settings.workingDays;

    return workingDays.includes(dayOfWeek);
  }

  /**
   * Validates if a booking can be made in advance
   */
  canBookInAdvance(bookingDate: Date): boolean {
    const settings = this.systemParametersService.parameters();
    const now = new Date();
    const daysInAdvance = settings.bookingAdvanceDays;
    const maxBookingDate = new Date(now.getTime() + daysInAdvance * 24 * 60 * 60 * 1000);

    return bookingDate <= maxBookingDate;
  }

  /**
   * Validates if a booking can be made with the specified advance time
   */
  canBookWithAdvanceTime(bookingDate: Date, bookingTime: string): boolean {
    const settings = this.systemParametersService.parameters();
    const now = new Date();
    const advanceTimeMinutes = settings.bookingAdvanceTime;
    const bookingDateTime = new Date(bookingDate);
    const [hour, minute] = bookingTime.split(':').map(Number);
    bookingDateTime.setHours(hour, minute, 0, 0);

    const minBookingTime = new Date(now.getTime() + advanceTimeMinutes * 60 * 1000);

    return bookingDateTime >= minBookingTime;
  }

  /**
   * Validates if a booking can be cancelled
   */
  canCancelBooking(bookingDate: Date, bookingTime: string): boolean {
    const settings = this.systemParametersService.parameters();

    if (!settings.preventCancellation) {
      return true;
    }

    const now = new Date();
    const bookingDateTime = new Date(bookingDate);
    const [hour, minute] = bookingTime.split(':').map(Number);
    bookingDateTime.setHours(hour, minute, 0, 0);

    const cancellationTimeLimit = settings.cancellationTimeLimit;
    const minCancellationTime = new Date(bookingDateTime.getTime() - cancellationTimeLimit * 60 * 60 * 1000);

    return now <= minCancellationTime;
  }

  /**
   * Validates if a booking can be made at the specified date and time
   */
  canBookAppointment(bookingDate: Date, bookingTime: string, userBookings: Booking[] = []): boolean {
    return this.canBookOnDate(bookingDate) &&
           this.canBookAtTime(bookingDate, bookingTime) &&
           this.canBookInAdvance(bookingDate) &&
           this.canBookWithAdvanceTime(bookingDate, bookingTime) &&
           this.canUserBookMoreAppointments(userBookings);
  }

  /**
   * Validates if a service can be booked at the specified date and time
   * Simplified logic: no conflicts with existing bookings, no blocked hours, no non-working hours
   */
  canBookServiceAtTime(bookingDate: Date, bookingTime: string, serviceDuration: number, allBookings: Booking[] = []): boolean {
    // Check basic booking validation
    if (!this.canBookAppointment(bookingDate, bookingTime, allBookings)) {
      return false;
    }

    // Check if service would overlap with blocked hours (lunch break)
    if (this.wouldServiceOverlapBlockedHours(bookingDate, bookingTime, serviceDuration)) {
      return false;
    }

    // Check if service would extend beyond business hours
    if (this.wouldServiceExtendBeyondBusinessHours(bookingDate, bookingTime, serviceDuration)) {
      return false;
    }

    // Check for conflicts with existing bookings
    return !this.hasTimeSlotConflict(bookingDate, bookingTime, serviceDuration, allBookings);
  }

    /**
   * Checks if there's a time slot conflict for a given service duration
   */
  private hasTimeSlotConflict(bookingDate: Date, bookingTime: string, serviceDuration: number, allBookings: Booking[]): boolean {
    const [startHour, startMinute] = bookingTime.split(':').map(Number);
    const bookingStart = new Date(bookingDate);
    bookingStart.setHours(startHour, startMinute, 0, 0);

    const bookingEnd = new Date(bookingStart.getTime() + serviceDuration * 60 * 1000);

    // Check conflicts with existing bookings
    const dateString = this.formatDateISO(bookingDate);

    return allBookings.some(existingBooking => {
      // Only check confirmed bookings on the same date
      if (existingBooking.status !== 'confirmed' || existingBooking.data !== dateString) {
        return false;
      }

      if (!existingBooking.hora) {
        return false;
      }

      // Get the service duration for the existing booking
      let existingServiceDuration = 60; // Default duration
      if (existingBooking.serviceId) {
        const existingService = this.firebaseServicesService.services().find(s => s.id === existingBooking.serviceId);
        if (existingService) {
          existingServiceDuration = existingService.duration;
        }
      }

      const [existingHour, existingMinute] = existingBooking.hora.split(':').map(Number);
      const existingStart = new Date(bookingDate);
      existingStart.setHours(existingHour, existingMinute, 0, 0);

      const existingEnd = new Date(existingStart.getTime() + existingServiceDuration * 60 * 1000);

      // Check for overlap
      return bookingStart < existingEnd && bookingEnd > existingStart;
    });
  }

  /**
   * Formats a date to ISO string format (YYYY-MM-DD)
   */
  private formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Checks if a service would overlap with blocked hours (lunch break)
   */
  wouldServiceOverlapBlockedHours(bookingDate: Date, bookingTime: string, serviceDuration: number): boolean {
    const settings = this.systemParametersService.parameters();
    const businessHours = settings.businessHours;
    const lunchStart = businessHours.lunchStart;
    const lunchEnd = businessHours.lunchEnd;

    const [startHour, startMinute] = bookingTime.split(':').map(Number);
    const startDateTime = new Date(bookingDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + serviceDuration * 60 * 1000);

    // Create lunch break time range for the booking date
    const lunchStartDateTime = new Date(bookingDate);
    lunchStartDateTime.setHours(lunchStart, 0, 0, 0);
    const lunchEndDateTime = new Date(bookingDate);
    lunchEndDateTime.setHours(lunchEnd, 0, 0, 0);

    // Check for overlap with lunch break
    // Service overlaps if it starts before lunch ends AND ends after lunch starts
    return startDateTime < lunchEndDateTime && endDateTime > lunchStartDateTime;
  }

  /**
   * Checks if a service would extend beyond business hours
   */
  wouldServiceExtendBeyondBusinessHours(bookingDate: Date, bookingTime: string, serviceDuration: number): boolean {
    const settings = this.systemParametersService.parameters();
    const businessHours = settings.businessHours;
    const endHour = businessHours.end;

    const [startHour, startMinute] = bookingTime.split(':').map(Number);
    const startDateTime = new Date(bookingDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + serviceDuration * 60 * 1000);
    const serviceEndHour = endDateTime.getHours();
    const serviceEndMinute = endDateTime.getMinutes();

    // Service extends beyond business hours (but not exactly at closing time)
    if (serviceEndHour > endHour || (serviceEndHour === endHour && serviceEndMinute > 0)) {
      return true;
    }

    return false;
  }

  /**
   * Checks if a slot is booked for a given date and time
   */
  isSlotBooked(date: Date, time: string, serviceDuration: number, allBookings: Booking[]): boolean {
    const dateString = this.formatDateISO(date);
    const [startHour, startMinute] = time.split(':').map(Number);

    // Calculate time ranges
    const slotStart = new Date(date);
    slotStart.setHours(startHour, startMinute, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60 * 1000);

    return allBookings.some(booking => {
      // Check if booking is confirmed and matches the date
      if (booking.status !== 'confirmed' || booking.data !== dateString) {
        return false;
      }

      // Check if the booking time overlaps with the slot we're checking
      const bookingTime = booking.hora;
      if (!bookingTime) return false;

      // Get the service duration for this booking
      let bookingDuration = 60; // Default duration
      if (booking.serviceId) {
        const existingService = this.firebaseServicesService.services().find(s => s.id === booking.serviceId);
        if (existingService) {
          bookingDuration = existingService.duration;
        }
      }

      const [bookingHour, bookingMinute] = bookingTime.split(':').map(Number);
      const bookingStart = new Date(date);
      bookingStart.setHours(bookingHour, bookingMinute, 0, 0);
      const bookingEnd = new Date(bookingStart.getTime() + bookingDuration * 60 * 1000);

      // Check for overlap
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  }

  /**
   * Gets the booking for a specific slot
   */
  getBookingForSlot(date: Date, time: string, serviceDuration: number, allBookings: Booking[]): Booking | undefined {
    const dateString = this.formatDateISO(date);
    const [startHour, startMinute] = time.split(':').map(Number);

    // Calculate the time range for the slot we're checking
    const slotStart = new Date(date);
    slotStart.setHours(startHour, startMinute, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60 * 1000);

    return allBookings.find(booking => {
      // Check if booking is confirmed and matches the date
      if (booking.status !== 'confirmed' || booking.data !== dateString) {
        return false;
      }

      // Check if the booking time overlaps with the slot we're checking
      const bookingTime = booking.hora;
      if (!bookingTime) return false;

      // Get the service duration for this booking
      let bookingDuration = 60; // Default duration
      if (booking.serviceId) {
        const existingService = this.firebaseServicesService.services().find(s => s.id === booking.serviceId);
        if (existingService) {
          bookingDuration = existingService.duration;
        }
      }

      // Calculate booking time range
      const [bookingHour, bookingMinute] = bookingTime.split(':').map(Number);
      const bookingStart = new Date(date);
      bookingStart.setHours(bookingHour, bookingMinute, 0, 0);
      const bookingEnd = new Date(bookingStart.getTime() + bookingDuration * 60 * 1000);

      // Check for overlap
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  }

  /**
   * Generates available days for booking (consistent between mobile and desktop)
   */
  generateAvailableDays(startDate: Date, endDate: Date): Date[] {
    const availableDays: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (this.canBookOnDate(currentDate) && this.canBookInAdvance(currentDate)) {
        availableDays.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableDays;
  }

  /**
   * Generates time slots for a given date and service
   */
  generateTimeSlotsForService(date: Date, serviceDuration: number, allBookings: Booking[]): TimeSlot[] {
    const slots: TimeSlot[] = [];

    const settings = this.systemParametersService.parameters();
    const businessHours = settings.businessHours;
    const slotDuration = settings.appointmentDuration;
    const dayOfWeek = date.getDay();

    // Check if it's a business day
    if (!settings.workingDays.includes(dayOfWeek)) {
      return slots;
    }

    const startHour = businessHours.start;
    const endHour = businessHours.end;
    const now = new Date();
    const isToday = this.isSameDay(date, now);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDate = new Date(date);
        slotDate.setHours(hour, minute, 0, 0);

        // Calculate service end time
        const serviceEndDate = new Date(slotDate.getTime() + serviceDuration * 60 * 1000);
        const serviceEndHour = serviceEndDate.getHours();

        // Skip if service would extend beyond business hours (but not exactly at closing time)
        if (serviceEndHour > endHour || (serviceEndHour === endHour && serviceEndDate.getMinutes() > 0)) {
          continue;
        }

        // Service ends exactly at closing time (allowed)
        if (serviceEndHour === endHour && serviceEndDate.getMinutes() === 0) {
          // Continue to next validations
        }

        // Skip if service would overlap with blocked hours
        if (this.wouldServiceOverlapBlockedHours(date, timeString, serviceDuration)) {
          continue;
        }

        // Skip past hours (only for today)
        if (isToday && slotDate <= now) {
          continue;
        }

        // Check advance time validation - only show slots that can be booked with advance time
        if (!this.canBookWithAdvanceTime(date, timeString)) {
          continue;
        }

        // Check if slot is available (not booked)
        const isAvailable = !this.isSlotBooked(date, timeString, serviceDuration, allBookings);

        // Get booking details if slot is occupied
        const booking = this.getBookingForSlot(date, timeString, serviceDuration, allBookings);

        slots.push({
          time: timeString,
          available: isAvailable,
          isSelected: false,
          clientName: booking?.clientName,
          serviceName: '', // Service name will be retrieved from service service
          serviceIcon: this.getServiceIcon(booking?.serviceId),
          bookingId: booking?.id,
          notes: booking?.notes,
        });
      }
    }

    return slots;
  }

  /**
   * Gets the service icon for a given service ID
   */
  private getServiceIcon(serviceId?: string): string {
    if (!serviceId) return '🔧';
    const service = this.firebaseServicesService.services().find(s => s.id === serviceId);
    return service?.icon || '🔧';
  }

  /**
   * Checks if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Validates if the current user can book more appointments
   */
  canUserBookMoreAppointments(userBookings: Booking[] = []): boolean {
    const currentUser = this.authService.user();
    if (!currentUser?.uid) {
      return false; // User not authenticated
    }

    const maxAppointmentsPerUser = this.systemParametersService.getMaxAppointmentsPerUser();

    // Filter bookings that belong to the current user (by uid first, then email as fallback)
    const confirmedUserBookings = userBookings.filter(booking => {
      const isUserBooking = booking.uid === currentUser.uid || booking.email === currentUser.email;
      const isConfirmed = booking.status === 'confirmed';
      const isFutureBooking = this.isFutureBooking(booking);

      return isUserBooking && isConfirmed && isFutureBooking;
    });

    return confirmedUserBookings.length < maxAppointmentsPerUser;
  }

  /**
   * Checks if a booking is in the future
   */
  private isFutureBooking(booking: Booking): boolean {
    if (!booking.data || !booking.hora) {
      return false;
    }

    const now = new Date();
    const bookingDate = new Date(booking.data);
    const [hour, minute] = booking.hora.split(':').map(Number);
    bookingDate.setHours(hour, minute, 0, 0);

    return bookingDate > now;
  }

  /**
   * Gets the number of appointments the current user has
   */
  getUserAppointmentCount(userBookings: Booking[] = []): number {
    const currentUser = this.authService.user();
    if (!currentUser?.uid) {
      return 0;
    }

    // Filter bookings that belong to the current user (by uid first, then email as fallback) and are future bookings
    return userBookings.filter(booking => {
      const isUserBooking = booking.uid === currentUser.uid || booking.email === currentUser.email;
      const isConfirmed = booking.status === 'confirmed';
      const isFutureBooking = this.isFutureBooking(booking);

      return isUserBooking && isConfirmed && isFutureBooking;
    }).length;
  }
}
