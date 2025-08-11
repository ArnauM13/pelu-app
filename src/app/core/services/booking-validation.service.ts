import { Injectable, inject } from '@angular/core';
import { SystemParametersService } from './system-parameters.service';
import { AuthService } from '../auth/auth.service';
import { Booking } from '../interfaces/booking.interface';

@Injectable({
  providedIn: 'root',
})
export class BookingValidationService {
  private readonly systemParametersService = inject(SystemParametersService);
  private readonly authService = inject(AuthService);

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
   * Validates if the current user can book more appointments
   */
  canUserBookMoreAppointments(userBookings: Booking[] = []): boolean {
    const currentUser = this.authService.user();
    if (!currentUser?.uid) {
      return false; // User not authenticated
    }

    const maxAppointmentsPerUser = this.systemParametersService.getMaxAppointmentsPerUser();
    const confirmedUserBookings = userBookings.filter(booking => 
      booking.email === currentUser.email && 
      booking.status === 'confirmed'
    );

    return confirmedUserBookings.length < maxAppointmentsPerUser;
  }

  /**
   * Gets the number of appointments the current user has
   */
  getUserAppointmentCount(userBookings: Booking[] = []): number {
    const currentUser = this.authService.user();
    if (!currentUser?.uid) {
      return 0;
    }

    return userBookings.filter(booking => 
      booking.email === currentUser.email && 
      booking.status === 'confirmed'
    ).length;
  }
}
