import { Injectable, inject } from '@angular/core';
import { BusinessSettingsService } from './business-settings.service';

@Injectable({
  providedIn: 'root',
})
export class BookingValidationService {
  private readonly businessSettingsService = inject(BusinessSettingsService);

  /**
   * Check if a booking can be cancelled based on the configured time limit
   */
  canCancelBooking(appointmentDate: Date, appointmentTime: string): boolean {
    const settings = this.businessSettingsService.settings();

    // If cancellation is not prevented, allow cancellation
    if (!settings.preventCancellation) {
      return true;
    }

    // Create the full appointment datetime
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const appointmentDateTime = new Date(appointmentDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const timeDifferenceMs = appointmentDateTime.getTime() - now.getTime();
    const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);

    // Allow cancellation if the appointment is more than the configured time limit away
    return timeDifferenceHours >= settings.cancellationTimeLimit;
  }

  /**
   * Check if a booking can be made for a specific date and time
   */
  canBookAppointment(bookingDate: Date, bookingTime: string): boolean {
    const settings = this.businessSettingsService.settings();
    const now = new Date();

    // Create the full booking datetime
    const [hours, minutes] = bookingTime.split(':').map(Number);
    const bookingDateTime = new Date(bookingDate);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    // Check if the booking is in the past
    if (bookingDateTime <= now) {
      return false;
    }

    // Check advance days limit
    const daysDifference = Math.ceil((bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDifference > settings.bookingAdvanceDays) {
      return false;
    }

    // Check advance time limit (only if booking is today)
    const isToday = bookingDate.toDateString() === now.toDateString();
    if (isToday) {
      const timeDifferenceMs = bookingDateTime.getTime() - now.getTime();
      const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);

      if (timeDifferenceMinutes < settings.bookingAdvanceTime) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get the minimum booking time (current time + advance time limit)
   */
  getMinimumBookingTime(): Date {
    const settings = this.businessSettingsService.settings();
    const now = new Date();
    const minimumTime = new Date(now.getTime() + (settings.bookingAdvanceTime * 60 * 1000));
    return minimumTime;
  }

  /**
   * Get the maximum booking date (current date + advance days limit)
   */
  getMaximumBookingDate(): Date {
    const settings = this.businessSettingsService.settings();
    const now = new Date();
    const maximumDate = new Date(now.getTime() + (settings.bookingAdvanceDays * 24 * 60 * 60 * 1000));
    return maximumDate;
  }

  /**
   * Get the cancellation deadline for a specific appointment
   */
  getCancellationDeadline(appointmentDate: Date, appointmentTime: string): Date | null {
    const settings = this.businessSettingsService.settings();

    if (!settings.preventCancellation) {
      return null; // No deadline if cancellation is not prevented
    }

    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const appointmentDateTime = new Date(appointmentDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const deadline = new Date(appointmentDateTime.getTime() - (settings.cancellationTimeLimit * 60 * 60 * 1000));
    return deadline;
  }

  /**
   * Check if the current time is within the cancellation window for an appointment
   */
  isWithinCancellationWindow(appointmentDate: Date, appointmentTime: string): boolean {
    const deadline = this.getCancellationDeadline(appointmentDate, appointmentTime);
    if (!deadline) return true; // No deadline means always within window

    const now = new Date();
    return now < deadline;
  }
}
