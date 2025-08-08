import { Injectable, inject } from '@angular/core';
import { addDays, eachDayOfInterval, addMinutes } from 'date-fns';
import { AppointmentEvent } from '../core/calendar.component';
import { SystemParametersService } from '../../../core/services/system-parameters.service';

export interface BusinessConfig {
  slotDuration: number;
  businessHours: {
    start: number;
    end: number;
  };
  lunchBreak: {
    start: number;
    end: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CalendarBusinessService {
  private readonly systemParametersService = inject(SystemParametersService);

  // Get slot duration dynamically from system parameters
  private getSlotDuration(): number {
    return this.systemParametersService.getAppointmentDuration();
  }

  /**
   * Get business days for a week
   */
  getBusinessDaysForWeek(startDate: Date, endDate: Date): Date[] {
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    return allDays.filter((day: Date) => this.isBusinessDay(day));
  }

  /**
   * Check if a date is a business day
   */
  isBusinessDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    const workingDays = this.systemParametersService.workingDays();
    return workingDays.includes(dayOfWeek);
  }

  /**
   * Check if a time is during lunch break
   */
  isLunchBreak(time: string): boolean {
    return this.systemParametersService.isLunchBreak(time);
  }

  /**
   * Get business hours for a specific date
   */
  getBusinessHoursForDate(date: Date): { start: number; end: number } {
    if (!this.isBusinessDay(date)) {
      return { start: 0, end: 0 };
    }

    const businessHours = this.systemParametersService.businessHours();
    return {
      start: businessHours.start,
      end: businessHours.end,
    };
  }

  /**
   * Get available time slots for a specific date
   */
  getAvailableTimeSlots(date: Date, existingAppointments: AppointmentEvent[] = []): string[] {
    const businessHours = this.getBusinessHoursForDate(date);
    const slots: string[] = [];

    if (businessHours.start === 0 && businessHours.end === 0) {
      return slots; // Not a business day
    }

    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += this.getSlotDuration()) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Skip lunch break
        if (this.isLunchBreak(timeString)) {
          continue;
        }

        // Check if slot is available (not occupied by existing appointment)
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);

        const isSlotAvailable = !existingAppointments.some(appointment => {
          const appointmentStart = new Date(appointment.start);
          const appointmentEnd = appointment.end
            ? new Date(appointment.end)
            : addMinutes(appointmentStart, appointment.duration || 60);

          // Check for overlap - use the actual appointment duration instead of hardcoded 30 minutes
          const slotEnd = addMinutes(slotStart, appointment.duration || 60);
          return appointmentStart < slotEnd && appointmentEnd > slotStart;
        });

        if (isSlotAvailable) {
          slots.push(timeString);
        }
      }
    }

    return slots;
  }

  /**
   * Get next business day
   */
  getNextBusinessDay(currentDate: Date): Date {
    let nextDay = addDays(currentDate, 1);

    while (!this.isBusinessDay(nextDay)) {
      nextDay = addDays(nextDay, 1);
    }

    return nextDay;
  }

  /**
   * Get business days for a month
   */
  getBusinessDaysForMonth(year: number, month: number): Date[] {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    return allDays.filter((day: Date) => this.isBusinessDay(day));
  }



  /**
   * Get business configuration
   */
  getBusinessConfig() {
    const businessHours = this.systemParametersService.businessHours();
    const lunchBreak = this.systemParametersService.lunchBreak();
    const workingDays = this.systemParametersService.workingDays();

    return {
      hours: {
        start: businessHours.start,
        end: businessHours.end,
      },
      lunchBreak: {
        start: lunchBreak.start,
        end: lunchBreak.end,
      },
      days: workingDays,
    };
  }

  /**
   * Generate time slots for the calendar
   */
  generateTimeSlots(): string[] {
    const businessConfig = this.getBusinessConfig();
    const slots: string[] = [];

    const startHour = businessConfig.hours.start;
    const endHour = businessConfig.hours.end;
    const slotDuration = this.getSlotDuration();

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }

    return slots;
  }

  /**
   * Check if a day has available time slots
   */
  hasAvailableTimeSlots(day: Date, existingAppointments: AppointmentEvent[]): boolean {
    const availableSlots = this.getAvailableTimeSlots(day, existingAppointments);
    return availableSlots.length > 0;
  }
}
