import { Injectable, inject } from '@angular/core';
import { eachDayOfInterval, addMinutes, isSameDay } from 'date-fns';
import { AppointmentEvent } from '../core/calendar.component';
import { BusinessSettingsService } from '../../../core/services/business-settings.service';

export interface BusinessConfig {
  hours: {
    start: number;
    end: number;
  };
  days: {
    start: number; // 0 = Sunday, 1 = Monday, etc.
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
  private readonly businessSettingsService = inject(BusinessSettingsService);

  private readonly businessConfig: BusinessConfig = {
    hours: {
      start: 8,
      end: 20,
    },
    days: {
      start: 2, // Tuesday
      end: 6, // Saturday
    },
    lunchBreak: {
      start: 13,
      end: 15,
    },
  };

  /**
   * Get business configuration
   */
  getBusinessConfig(): BusinessConfig {
    const businessHours = this.businessSettingsService.getBusinessHours();
    const workingDays = this.businessSettingsService.getWorkingDays();
    const lunchBreak = this.businessSettingsService.getLunchBreakNumeric();

    return {
      hours: {
        start: businessHours.start,
        end: businessHours.end,
      },
      days: {
        start: Math.min(...workingDays),
        end: Math.max(...workingDays),
      },
      lunchBreak: {
        start: lunchBreak.start,
        end: lunchBreak.end,
      },
    };
  }

  /**
   * Check if a day of week is a business day
   */
  isBusinessDay(dayOfWeek: number): boolean {
    return this.businessSettingsService.isWorkingDay(dayOfWeek);
  }

  /**
   * Check if a time is during lunch break
   */
  isLunchBreak(time: string): boolean {
    return this.businessSettingsService.isLunchBreak(time);
  }

  /**
   * Check if a time slot is bookable (allows reservations except during lunch break)
   */
  isTimeSlotBookable(time: string): boolean {
    // If it's lunch break time, it's not bookable
    if (this.isLunchBreak(time)) {
      return false;
    }

    // All other times during business hours are bookable
    const businessHours = this.businessSettingsService.getBusinessHours();
    const [hour] = time.split(':').map(Number);
    return hour >= businessHours.start && hour < businessHours.end;
  }

  /**
   * Get business days for a week
   */
  getBusinessDaysForWeek(viewDate: Date): Date[] {
    // Start from the selected date instead of Monday of the week
    const start = new Date(viewDate);
    start.setHours(0, 0, 0, 0);

    // End 6 days after the start date to show a full week
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const allDays = eachDayOfInterval({ start, end });

    // Filter to show only business days
    return allDays.filter(day => {
      const dayOfWeek = day.getDay();
      return this.isBusinessDay(dayOfWeek);
    });
  }

  /**
   * Generate time slots for business hours (including lunch break slots)
   */
  generateTimeSlots(): string[] {
    const slots: string[] = [];
    const businessHours = this.businessSettingsService.getBusinessHours();
    const slotDuration = this.businessSettingsService.getAppointmentDuration();

    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }

    return slots;
  }

  /**
   * Get appropriate view date considering business days
   */
  getAppropriateViewDate(): Date {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const workingDays = this.businessSettingsService.getWorkingDays();

    // If today is outside business days, jump to next business week
    if (!this.businessSettingsService.isWorkingDay(currentDayOfWeek)) {
      let daysToAdd = 1;

      // Find the next business day
      while (daysToAdd <= 7) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + daysToAdd);
        if (this.businessSettingsService.isWorkingDay(nextDay.getDay())) {
          return nextDay;
        }
        daysToAdd++;
      }
    }

    // If today is a business day, show current week
    return today;
  }

  /**
   * Check if a date is in the past
   */
  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  /**
   * Check if a time slot is in the past
   */
  isPastTimeSlot(date: Date, time: string): boolean {
    const [hour, minute] = time.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);

    const now = new Date();
    return slotTime < now;
  }

  /**
   * Get appointments for a specific day
   */
  getAppointmentsForDay(date: Date, appointments: AppointmentEvent[]): AppointmentEvent[] {
    return appointments.filter(appointment => {
      if (!appointment.start) return false;
      const appointmentDate = new Date(appointment.start);
      return isSameDay(appointmentDate, date);
    });
  }

  /**
   * Get business days info string
   */
  getBusinessDaysInfo(): string {
    const dayNames = [
      'Diumenge',
      'Dilluns',
      'Dimarts',
      'Dimecres',
      'Dijous',
      'Divendres',
      'Dissabte',
    ];
    const workingDays = this.businessSettingsService.getWorkingDays();
    const startDay = dayNames[Math.min(...workingDays)];
    const endDay = dayNames[Math.max(...workingDays)];
    return `${startDay} - ${endDay}`;
  }

  /**
   * Get business hours info string
   */
  getBusinessHoursInfo(): string {
    const businessHours = this.businessSettingsService.getBusinessHoursString();
    return `${businessHours.start} - ${businessHours.end}`;
  }

  /**
   * Check if can navigate to previous week
   */
  canNavigateToPreviousWeek(
    currentViewDate: Date = new Date(),
    appointments: AppointmentEvent[] = []
  ): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Calcular la data d'inici de la setmana anterior
    const prevWeekStart = new Date(currentViewDate);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    // Si algun dia de la setmana anterior és igual o posterior a avui i té hores disponibles, permet navegar-hi
    const weekDays = this.getBusinessDaysForWeek(prevWeekStart);
    return weekDays.some(day => {
      // Always allow navigation to past days
      if (day >= today) {
        return true;
      }
      // For future days, check if they have available time slots
      return this.hasAvailableTimeSlots(day, appointments);
    });
  }

  /**
   * Check if a day has any available time slots
   */
  hasAvailableTimeSlots(date: Date, appointments: AppointmentEvent[]): boolean {
    const timeSlots = this.generateTimeSlots();
    const dayAppointments = this.getAppointmentsForDay(date, appointments);

    // Check if any time slot is available
    for (const timeSlot of timeSlots) {
      const [hour, minute] = timeSlot.split(':').map(Number);
      const slotStart = new Date(date);
      slotStart.setHours(hour, minute, 0, 0);

      // Skip if slot is in the past
      if (this.isPastTimeSlot(date, timeSlot)) {
        continue;
      }

      // Check if slot is available (not occupied by any appointment)
      const isAvailable = !dayAppointments.some(appointment => {
        if (!appointment.start) return false;

        const appointmentStart = new Date(appointment.start);
        const appointmentEnd = appointment.end
          ? new Date(appointment.end)
          : addMinutes(appointmentStart, appointment.duration || 60);

        // Check for overlap
        return appointmentStart < addMinutes(slotStart, 30) && appointmentEnd > slotStart;
      });

      if (isAvailable) {
        return true;
      }
    }

    return false;
  }
}
