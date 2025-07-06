import { Injectable } from '@angular/core';
import { startOfWeek, endOfWeek, eachDayOfInterval, addMinutes, isSameDay } from 'date-fns';
import { AppointmentEvent } from './calendar.component';

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
  providedIn: 'root'
})
export class CalendarBusinessService {
  private readonly businessConfig: BusinessConfig = {
    hours: {
      start: 8,
      end: 20
    },
    days: {
      start: 2, // Tuesday
      end: 6    // Saturday
    },
    lunchBreak: {
      start: 13,
      end: 15
    }
  };

  /**
   * Get business configuration
   */
  getBusinessConfig(): BusinessConfig {
    return this.businessConfig;
  }

  /**
   * Check if a day of week is a business day
   */
  isBusinessDay(dayOfWeek: number): boolean {
    return dayOfWeek >= this.businessConfig.days.start && dayOfWeek <= this.businessConfig.days.end;
  }

  /**
   * Check if a time is during lunch break
   */
  isLunchBreak(time: string): boolean {
    const [hour] = time.split(':').map(Number);
    return hour >= this.businessConfig.lunchBreak.start && hour < this.businessConfig.lunchBreak.end;
  }

  /**
   * Check if a time is the start of lunch break
   */
  isLunchBreakStart(time: string): boolean {
    const [hour, minute] = time.split(':').map(Number);
    return hour === this.businessConfig.lunchBreak.start && minute === 0;
  }

  /**
   * Get business days for a week
   */
  getBusinessDaysForWeek(viewDate: Date): Date[] {
    const start = startOfWeek(viewDate, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(viewDate, { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start, end });

    // Filter to show only business days
    return allDays.filter(day => {
      const dayOfWeek = day.getDay();
      return this.isBusinessDay(dayOfWeek);
    });
  }

  /**
   * Generate time slots for business hours
   */
  generateTimeSlots(): string[] {
    const slots: string[] = [];
    const startHour = this.businessConfig.hours.start;
    const endHour = this.businessConfig.hours.end;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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

    // If today is outside business days, jump to next business week
    if (currentDayOfWeek < this.businessConfig.days.start || currentDayOfWeek > this.businessConfig.days.end) {
      let daysToAdd: number;

      if (currentDayOfWeek < this.businessConfig.days.start) {
        // Before business days (Sunday, Monday) - jump to next Tuesday
        daysToAdd = this.businessConfig.days.start - currentDayOfWeek;
      } else {
        // After business days (Sunday) - jump to next Tuesday
        daysToAdd = 7 - currentDayOfWeek + this.businessConfig.days.start;
      }

      const nextBusinessDay = new Date(today);
      nextBusinessDay.setDate(today.getDate() + daysToAdd);

      return nextBusinessDay;
    } else {
      // If today is a business day, show current week
      return today;
    }
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
    const dayNames = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
    const startDay = dayNames[this.businessConfig.days.start];
    const endDay = dayNames[this.businessConfig.days.end];
    return `${startDay} - ${endDay}`;
  }

  /**
   * Get business hours info string
   */
  getBusinessHoursInfo(): string {
    return `${this.businessConfig.hours.start}:00 - ${this.businessConfig.hours.end}:00`;
  }

  /**
   * Check if can navigate to previous week
   */
  canNavigateToPreviousWeek(): boolean {
    const today = new Date();
    const currentDayOfWeek = today.getDay();

    // If today is a business day, allow navigation
    if (this.isBusinessDay(currentDayOfWeek)) {
      return true;
    }

    // If today is before business days, allow navigation
    if (currentDayOfWeek < this.businessConfig.days.start) {
      return true;
    }

    return false;
  }
}
