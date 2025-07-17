import { Injectable, computed, signal } from '@angular/core';
import { addMinutes } from 'date-fns';
import { AppointmentEvent } from './calendar.component';

export interface AppointmentPosition {
  top: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarPositionService {
  // Constants
  private readonly SLOT_DURATION_MINUTES = 30;
  private readonly PIXELS_PER_MINUTE = 1;
  private readonly SLOT_HEIGHT_PX = this.SLOT_DURATION_MINUTES * this.PIXELS_PER_MINUTE;

  // Business hours
  private readonly businessHours = {
    start: 8,
    end: 20
  };

  /**
   * Calculate the top position in pixels for an appointment
   */
  calculateAppointmentTop(appointment: AppointmentEvent): number {
    if (!appointment.start) {
      return 0;
    }

    const startDate = new Date(appointment.start);
    const startHour = startDate.getHours();
    const startMinute = startDate.getMinutes();

    // Calculate minutes since business start
    const minutesSinceStart = (startHour - this.businessHours.start) * 60 + startMinute;

    // Convert to pixels
    return minutesSinceStart * this.PIXELS_PER_MINUTE;
  }

  /**
   * Calculate the height in pixels for an appointment
   */
  calculateAppointmentHeight(appointment: AppointmentEvent): number {
    const duration = appointment.duration || 60;
    return duration * this.PIXELS_PER_MINUTE;
  }

  /**
   * Get position data for an appointment
   */
  getAppointmentPosition(appointment: AppointmentEvent): AppointmentPosition {
    return {
      top: this.calculateAppointmentTop(appointment),
      height: this.calculateAppointmentHeight(appointment)
    };
  }

    /**
   * Get positions for multiple appointments
   */
  getAppointmentPositions(appointments: AppointmentEvent[]): Map<string, AppointmentPosition> {
    const positions = new Map<string, AppointmentPosition>();

    appointments.forEach(appointment => {
      // Use ID if available, otherwise use a combination of title and start time
      const key = appointment.id || `${appointment.title}-${appointment.start}`;
      positions.set(key, this.getAppointmentPosition(appointment));
    });

    return positions;
  }

  /**
   * Check if a time slot is available
   */
  isTimeSlotAvailable(date: Date, time: string, appointments: AppointmentEvent[], requestedDuration: number = this.SLOT_DURATION_MINUTES): boolean {
    const [hour, minute] = time.split(':').map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);

    const slotEnd = addMinutes(slotStart, requestedDuration);

    // Check if the time slot is during lunch break (13:00-15:00)
    if (this.isLunchBreak(time)) {
      return false;
    }

    // Check if the time slot is bookable (allows reservations until 12:30 and from 15:00)
    if (!this.isTimeSlotBookable(time)) {
      return false;
    }

    // Check if any appointment overlaps with this time slot
    return !appointments.some(appointment => {
      if (!appointment.start) return false;

      const appointmentStart = new Date(appointment.start);
      const appointmentEnd = appointment.end ? new Date(appointment.end) : addMinutes(appointmentStart, appointment.duration || 60);

      // Check for overlap
      return appointmentStart < slotEnd && appointmentEnd > slotStart;
    });
  }

  /**
   * Check if a time is during lunch break
   */
  private isLunchBreak(time: string): boolean {
    const [hour] = time.split(':').map(Number);
    return hour >= 13 && hour < 15; // Lunch break from 13:00 to 15:00
  }

  /**
   * Check if a time slot is bookable (allows reservations until 12:30 and from 15:00)
   */
  private isTimeSlotBookable(time: string): boolean {
    const [hour, minute] = time.split(':').map(Number);

    // Allow bookings until 12:30
    if (hour < 12 || (hour === 12 && minute <= 30)) {
      return true;
    }

    // Allow bookings from 15:00 onwards
    if (hour >= 15) {
      return true;
    }

    // Block 12:30-15:00 (lunch break period)
    return false;
  }

  /**
   * Get slot duration in minutes
   */
  getSlotDurationMinutes(): number {
    return this.SLOT_DURATION_MINUTES;
  }

  /**
   * Get pixels per minute ratio
   */
  getPixelsPerMinute(): number {
    return this.PIXELS_PER_MINUTE;
  }

  /**
   * Get slot height in pixels
   */
  getSlotHeightPx(): number {
    return this.SLOT_HEIGHT_PX;
  }
}
