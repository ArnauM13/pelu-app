import { Injectable } from '@angular/core';
import {
  format,
  isToday,
  isSameDay,
  isPast,
  isFuture,
  startOfDay,
  addDays as addDaysToDate,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  parseISO,
  isValid,
} from 'date-fns';
import { ca, Locale } from 'date-fns/locale';

export interface TimeSlot {
  time: string;
  available: boolean;
  isSelected: boolean;
  clientName?: string;
  serviceName?: string;
  serviceIcon?: string;
  bookingId?: string;
  notes?: string;
}

export interface DaySlot {
  date: Date;
  timeSlots: TimeSlot[];
}

export interface BusinessHours {
  start: string;
  end: string;
}

export interface LunchBreak {
  start: string;
  end: string;
}

export interface AppointmentEvent {
  id?: string;
  title: string;
  start: string;
  end?: string;
  duration?: number;
  serviceName?: string;
  clientName?: string;
  uid?: string;
  isOwnBooking?: boolean;
  canDrag?: boolean;
  canViewDetails?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TimeUtils {
  private readonly DEFAULT_LOCALE = ca;

  /**
   * Check if a date is today
   */
  isToday(date: Date): boolean {
    return isToday(date);
  }

  /**
   * Check if a date is in the past
   */
  isPastDay(date: Date): boolean {
    return isPast(startOfDay(date));
  }

  /**
   * Check if a date is in the future
   */
  isFutureDay(date: Date): boolean {
    return isFuture(startOfDay(date));
  }

  /**
   * Check if two dates are the same day
   */
  isSameDay(date1: Date, date2: Date): boolean {
    return isSameDay(date1, date2);
  }

  /**
   * Check if a date is selected (compared to another date)
   */
  isSelected(date: Date, selectedDate: Date | null): boolean {
    return selectedDate ? isSameDay(date, selectedDate) : false;
  }

  /**
   * Check if a date is in the current month
   */
  isCurrentMonth(date: Date, currentDate: Date): boolean {
    return (
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    );
  }

  /**
   * Check if a date is a business day (Monday-Saturday by default)
   */
  isBusinessDay(date: Date, workingDays: number[] = [1, 2, 3, 4, 5, 6]): boolean {
    const dayOfWeek = date.getDay();
    return workingDays.includes(dayOfWeek);
  }

  /**
   * Check if a time is during lunch break
   */
  isLunchBreak(time: string, lunchBreak: LunchBreak): boolean {
    const timeHour = parseInt(time.split(':')[0]);
    const lunchStartHour = parseInt(lunchBreak.start.split(':')[0]);
    const lunchEndHour = parseInt(lunchBreak.end.split(':')[0]);

    return timeHour >= lunchStartHour && timeHour < lunchEndHour;
  }

  /**
   * Check if a time slot is enabled (not during lunch break)
   */
  isTimeSlotEnabled(hour: number, lunchBreak: LunchBreak): boolean {
    const lunchStart = parseInt(lunchBreak.start.split(':')[0]);
    const lunchEnd = parseInt(lunchBreak.end.split(':')[0]);

    return !(hour >= lunchStart && hour < lunchEnd);
  }

  /**
   * Check if a time slot is bookable (alias for isTimeSlotEnabled)
   */
  isTimeSlotBookable(time: string, lunchBreak: LunchBreak): boolean {
    const hour = parseInt(time.split(':')[0]);
    return this.isTimeSlotEnabled(hour, lunchBreak);
  }

  /**
   * Check if a time slot is in the past
   */
  isPastTimeSlot(date: Date, time: string): boolean {
    const now = new Date();
    const slotTime = new Date(date);
    const [hour, minute] = time.split(':').map(Number);
    slotTime.setHours(hour, minute, 0, 0);

    return slotTime < now;
  }

  /**
   * Get appointments for a specific day
   */
  getAppointmentsForDay(date: Date, appointments: AppointmentEvent[]): AppointmentEvent[] {
    return appointments.filter(appointment => {
      if (!appointment.start) return false;
      const appointmentDate = new Date(appointment.start);
      return this.isSameDay(appointmentDate, date);
    });
  }

  /**
   * Check if navigation to previous week is allowed
   */
  canNavigateToPreviousWeek(viewDate: Date, appointments: AppointmentEvent[]): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Allow navigation to past weeks if there are appointments
    const hasPastAppointments = appointments.some(appointment => {
      if (!appointment.start) return false;
      const appointmentDate = new Date(appointment.start);
      return appointmentDate < today;
    });

    return hasPastAppointments;
  }

  /**
   * Get business days info
   */
  getBusinessDaysInfo(): string {
    return 'Dilluns - Dissabte';
  }

  /**
   * Check if a date can be selected (not past and is business day)
   */
  canSelectDate(date: Date, workingDays: number[] = [1, 2, 3, 4, 5, 6]): boolean {
    return !this.isPastDay(date) && this.isBusinessDay(date, workingDays);
  }

  /**
   * Get today's date
   */
  getToday(): Date {
    return new Date();
  }

  /**
   * Get tomorrow's date
   */
  getTomorrow(): Date {
    return addDaysToDate(new Date(), 1);
  }

  /**
   * Get next available date (next business day)
   */
  getNextAvailableDate(workingDays: number[] = [1, 2, 3, 4, 5, 6]): Date | null {
    for (let i = 0; i < 30; i++) {
      const date = addDaysToDate(new Date(), i);
      if (this.canSelectDate(date, workingDays)) {
        return date;
      }
    }
    return null;
  }

  /**
   * Get first business day of week
   */
  getFirstBusinessDayOfWeek(date: Date, workingDays: number[] = [1, 2, 3, 4, 5, 6]): Date {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    for (let i = 0; i < 7; i++) {
      const day = addDaysToDate(weekStart, i);
      if (workingDays.includes(day.getDay())) {
        return day;
      }
    }
    return weekStart;
  }

  /**
   * Get last business day of week
   */
  getLastBusinessDayOfWeek(date: Date, workingDays: number[] = [1, 2, 3, 4, 5, 6]): Date {
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    for (let i = 6; i >= 0; i--) {
      const day = addDaysToDate(weekEnd, -i);
      if (workingDays.includes(day.getDay())) {
        return day;
      }
    }
    return weekEnd;
  }

  /**
   * Get business days for a week
   */
  getBusinessDaysForWeek(startDate: Date, endDate: Date, workingDays: number[] = [1, 2, 3, 4, 5, 6]): Date[] {
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    return allDays.filter(day => this.isBusinessDay(day, workingDays));
  }

  /**
   * Get business days for a month
   */
  getBusinessDaysForMonth(year: number, month: number, workingDays: number[] = [1, 2, 3, 4, 5, 6]): Date[] {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    return allDays.filter(day => this.isBusinessDay(day, workingDays));
  }

  /**
   * Generate time slots for a specific date
   */
  generateTimeSlots(
    date: Date,
    businessHours: BusinessHours,
    slotDuration: number,
    lunchBreak: LunchBreak,
    workingDays: number[] = [1, 2, 3, 4, 5, 6],
    existingBookings: unknown[] = []
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const dayOfWeek = date.getDay();

    // Check if it's a business day
    if (!workingDays.includes(dayOfWeek)) {
      return slots;
    }

    const startHour = parseInt(businessHours.start.split(':')[0]);
    const endHour = parseInt(businessHours.end.split(':')[0]);
    const now = new Date();
    const isToday = this.isToday(date);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDate = new Date(date);
        slotDate.setHours(hour, minute, 0, 0);

        // Skip disabled time slots (lunch break, etc.)
        if (!this.isTimeSlotEnabled(hour, lunchBreak)) {
          continue;
        }

        // Skip past hours (only for today)
        if (isToday && slotDate <= now) {
          continue;
        }

        // Check if slot is available (not booked)
        const isAvailable = !this.isSlotBooked(date, timeString, existingBookings);

        // Get booking details if slot is occupied
        const booking = this.getBookingForSlot(date, timeString, existingBookings);
        const bookingObj = booking as { clientName?: string; serviceName?: string; serviceIcon?: string; id?: string; notes?: string } | undefined;

        slots.push({
          time: timeString,
          available: isAvailable,
          isSelected: false,
          clientName: bookingObj?.clientName,
          serviceName: bookingObj?.serviceName || '',
          serviceIcon: bookingObj?.serviceIcon || '🔧',
          bookingId: bookingObj?.id,
          notes: bookingObj?.notes,
        });
      }
    }

    return slots;
  }

  /**
   * Check if a slot is booked
   */
  private isSlotBooked(date: Date, time: string, bookings: unknown[]): boolean {
    const dateString = format(date, 'yyyy-MM-dd');
    return bookings.some(booking => {
      const bookingObj = booking as { status: string; data: string; hora: string };
      return (
        bookingObj.status === 'confirmed' &&
        bookingObj.data === dateString &&
        bookingObj.hora === time
      );
    });
  }

  /**
   * Get booking for a specific slot
   */
  private getBookingForSlot(date: Date, time: string, bookings: unknown[]): unknown | undefined {
    const dateString = format(date, 'yyyy-MM-dd');
    return bookings.find(booking => {
      const bookingObj = booking as { status: string; data: string; hora: string };
      return bookingObj.status === 'confirmed' &&
             bookingObj.data === dateString &&
             bookingObj.hora === time;
    });
  }

  /**
   * Get enabled time slots for a given date
   */
  getEnabledTimeSlots(
    date: Date,
    businessHours: BusinessHours,
    slotDuration: number,
    lunchBreak: LunchBreak,
    workingDays: number[] = [1, 2, 3, 4, 5, 6]
  ): string[] {
    const slots: string[] = [];
    const dayOfWeek = date.getDay();

    // Check if it's a business day
    if (!workingDays.includes(dayOfWeek)) {
      return slots;
    }

    const startHour = parseInt(businessHours.start.split(':')[0]);
    const endHour = parseInt(businessHours.end.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        if (this.isTimeSlotEnabled(hour, lunchBreak)) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(timeString);
        }
      }
    }

    return slots;
  }

  /**
   * Format date to display format
   */
  formatDay(date: Date, locale: Locale = this.DEFAULT_LOCALE): string {
    return format(date, 'EEEE, d MMMM', { locale });
  }

  /**
   * Format date to short display format
   */
  formatDayShort(date: Date, locale: Locale = this.DEFAULT_LOCALE): string {
    return format(date, 'EEE', { locale });
  }

  /**
   * Format time string
   */
  formatTime(time: string): string {
    return time;
  }

  /**
   * Format month and year
   */
  formatMonth(date: Date, locale: Locale = this.DEFAULT_LOCALE): string {
    return format(date, 'MMMM yyyy', { locale });
  }

  /**
   * Format date to ISO string
   */
  formatDateISO(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  /**
   * Parse date from string
   */
  parseDate(dateString: string): Date | null {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  }

  /**
   * Get week days for a specific date
   */
  getWeekDays(date: Date): Date[] {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }

  /**
   * Get month days for a specific date
   */
  getMonthDays(date: Date, workingDays: number[] = [1, 2, 3, 4, 5, 6]): Date[] {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    // Find the first business day of the week that contains the month start
    const firstBusinessDayOfWeek = this.getFirstBusinessDayOfWeek(monthStart, workingDays);

    // Find the last business day of the week that contains the month end
    const lastBusinessDayOfWeek = this.getLastBusinessDayOfWeek(monthEnd, workingDays);

    return eachDayOfInterval({ start: firstBusinessDayOfWeek, end: lastBusinessDayOfWeek });
  }

  /**
   * Get start of week for a given date
   */
  getStartOfWeek(date: Date): Date {
    return startOfWeek(date, { weekStartsOn: 1 });
  }

  /**
   * Get end of week for a given date
   */
  getEndOfWeek(date: Date): Date {
    return endOfWeek(date, { weekStartsOn: 1 });
  }

  /**
   * Add days to a date
   */
  addDays(date: Date, days: number): Date {
    return addDaysToDate(date, days);
  }

  /**
   * Get previous week
   */
  getPreviousWeek(currentDate: Date): Date {
    return subDays(currentDate, 7);
  }

  /**
   * Navigate to next week
   */
  getNextWeek(currentDate: Date): Date {
    return addDaysToDate(currentDate, 7);
  }

  /**
   * Navigate to previous month
   */
  getPreviousMonth(currentDate: Date): Date {
    return subMonths(currentDate, 1);
  }

  /**
   * Navigate to next month
   */
  getNextMonth(currentDate: Date): Date {
    return addMonths(currentDate, 1);
  }

  /**
   * Check if can navigate to previous period
   */
  canGoToPreviousPeriod(currentDate: Date, viewMode: 'week' | 'month'): boolean {
    const today = new Date();

    if (viewMode === 'week') {
      // Check if the previous week would be before today
      const previousWeekStart = this.getPreviousWeek(currentDate);
      const todayStart = startOfDay(today);
      return previousWeekStart >= todayStart;
    } else {
      // Check if the previous month would be before current month
      const previousMonth = this.getPreviousMonth(currentDate);
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return previousMonth >= currentMonth;
    }
  }

  /**
   * Get appropriate view date (today or next business day)
   */
  getAppropriateViewDate(workingDays: number[] = [1, 2, 3, 4, 5, 6]): Date {
    const today = new Date();

    if (this.canSelectDate(today, workingDays)) {
      return today;
    }

    // Find next available date
    const nextAvailable = this.getNextAvailableDate(workingDays);
    return nextAvailable || today;
  }

  /**
   * Get appropriate view date for weekly calendar (starts from first working day of week)
   */
  getAppropriateWeeklyViewDate(workingDays: number[] = [1, 2, 3, 4, 5, 6]): Date {
    const today = new Date();

    // Get the first working day of the current week
    const firstWorkingDayOfWeek = this.getFirstBusinessDayOfWeek(today, workingDays);

    // If today is a working day, use today
    if (this.canSelectDate(today, workingDays)) {
      return today;
    }

    // Otherwise, start from the first working day of the current week
    return firstWorkingDayOfWeek;
  }

  /**
   * Check if a day has morning slots
   */
  hasMorningSlots(daySlot: DaySlot): boolean {
    return daySlot.timeSlots.some(slot => slot.time < '13:00' && slot.available);
  }

  /**
   * Check if a day has afternoon slots
   */
  hasAfternoonSlots(daySlot: DaySlot): boolean {
    return daySlot.timeSlots.some(slot => slot.time >= '14:00' && slot.available);
  }

  /**
   * Get morning slots for a day
   */
  getMorningSlots(daySlot: DaySlot): TimeSlot[] {
    return daySlot.timeSlots.filter(slot => slot.time < '13:00' && slot.available);
  }

  /**
   * Get afternoon slots for a day
   */
  getAfternoonSlots(daySlot: DaySlot): TimeSlot[] {
    return daySlot.timeSlots.filter(slot => slot.time >= '14:00' && slot.available);
  }

  /**
   * Format duration in minutes to human readable format
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  }
}
