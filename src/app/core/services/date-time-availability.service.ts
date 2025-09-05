import { Injectable, computed, inject, signal } from '@angular/core';
import { BookingValidationService } from './booking-validation.service';
import { SystemParametersService } from './system-parameters.service';
import { BookingService } from './booking.service';
import { FirebaseServicesService } from './firebase-services.service';
import { TimeUtils, TimeSlot, DaySlot } from '../../shared/utils/time.utils';
import { Booking } from '../interfaces/booking.interface';
import { FirebaseService } from './firebase-services.service';

export interface DateTimeAvailabilityOptions {
  includeUnavailable?: boolean;
  filterByService?: string;
  maxDaysAhead?: number;
}

export interface WeekAvailability {
  weekStart: Date;
  weekEnd: Date;
  days: DayAvailability[];
}

export interface DayAvailability {
  date: Date;
  isWorkingDay: boolean;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  totalSlots: number;
  availableSlots: number;
}

@Injectable({
  providedIn: 'root'
})
export class DateTimeAvailabilityService {

  // ===== DEPENDENCIES =====
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly systemParametersService = inject(SystemParametersService);
  private readonly bookingService = inject(BookingService);
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly timeUtils = inject(TimeUtils);

  // ===== CACHE SIGNALS =====
  private readonly availabilityCache = signal<Map<string, DayAvailability>>(new Map());
  private readonly weekCache = signal<Map<string, WeekAvailability>>(new Map());

  // ===== COMPUTED PROPERTIES =====
  readonly businessHours = computed(() => this.systemParametersService.getBusinessHours());
  readonly workingDays = computed(() => this.systemParametersService.getWorkingDays());
  readonly appointmentDuration = computed(() => this.systemParametersService.getAppointmentDuration());

  // ===== PUBLIC METHODS =====

  /**
   * Get available time slots for a specific date and service
   * This is the main method that components should use
   */
  getAvailableTimeSlotsForDate(
    date: Date,
    serviceId: string,
    options: DateTimeAvailabilityOptions = {}
  ): TimeSlot[] {
    const service = this.getServiceById(serviceId);
    if (!service) {
      return [];
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(date, serviceId);
    const cached = this.availabilityCache().get(cacheKey);

    // Return cached result if available and still valid
    if (cached && this.isCacheValid(cached.date)) {
      return options.includeUnavailable
        ? cached.timeSlots
        : cached.timeSlots.filter(slot => slot.available);
    }

    // Generate fresh time slots
    const timeSlots = this.generateTimeSlotsForDateAndService(date, service);

    // Cache the result asynchronously to avoid signal write errors in computed contexts
    queueMicrotask(() => {
      this.cacheDay(date, serviceId, timeSlots);
    });

    return options.includeUnavailable
      ? timeSlots
      : timeSlots.filter(slot => slot.available);
  }

  /**
   * Get availability for an entire week
   * Optimized for calendar view
   */
  getWeekAvailability(
    weekStart: Date,
    serviceId?: string,
    options: DateTimeAvailabilityOptions = {}
  ): WeekAvailability {
    const cacheKey = this.generateWeekCacheKey(weekStart, serviceId);
    const cached = this.weekCache().get(cacheKey);

    // Return cached result if available and still valid
    if (cached && this.isWeekCacheValid(cached.weekStart)) {
      return cached;
    }

    // Generate fresh week availability
    const weekAvailability = this.generateWeekAvailability(weekStart, serviceId, options);

    // Cache the result asynchronously to avoid signal write errors in computed contexts
    queueMicrotask(() => {
      this.cacheWeek(weekStart, serviceId, weekAvailability);
    });

    return weekAvailability;
  }

  /**
   * Get availability for a single day
   */
  getDayAvailability(
    date: Date,
    serviceId?: string,
    options: DateTimeAvailabilityOptions = {}
  ): DayAvailability {
    if (serviceId) {
      const timeSlots = this.getAvailableTimeSlotsForDate(date, serviceId, { includeUnavailable: true });
      return this.createDayAvailability(date, timeSlots);
    }

    // If no service specified, get availability for all services
    return this.getDayAvailabilityAllServices(date, options);
  }

  /**
   * Check if a specific time slot is available
   */
  isTimeSlotAvailable(
    date: Date,
    time: string,
    serviceId: string
  ): boolean {
    const timeSlots = this.getAvailableTimeSlotsForDate(date, serviceId);
    const slot = timeSlots.find(s => s.time === time);
    return slot ? slot.available : false;
  }

  /**
   * Get next available slot for a service
   */
  getNextAvailableSlot(
    serviceId: string,
    fromDate: Date = new Date(),
    maxDaysAhead: number = 30
  ): { date: Date; time: string } | null {
    const endDate = new Date(fromDate.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000);

    for (let date = new Date(fromDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const timeSlots = this.getAvailableTimeSlotsForDate(new Date(date), serviceId);
      const availableSlot = timeSlots.find(slot => slot.available);

      if (availableSlot) {
        return {
          date: new Date(date),
          time: availableSlot.time
        };
      }
    }

    return null;
  }

  /**
   * Invalidate cache for a specific date
   */
  invalidateCache(date?: Date): void {
    if (date) {
      const keys = Array.from(this.availabilityCache().keys()).filter(key =>
        key.includes(this.formatDate(date))
      );
      const cache = new Map(this.availabilityCache());
      keys.forEach(key => cache.delete(key));
      this.availabilityCache.set(cache);
    } else {
      // Clear all cache
      this.availabilityCache.set(new Map());
      this.weekCache.set(new Map());
    }
  }

  /**
   * Get all available time slots for a week (optimized for calendar view)
   * This method is specifically designed for calendar components
   */
  getWeekTimeSlots(
    weekStart: Date,
    serviceId?: string
  ): Map<string, TimeSlot[]> {
    const weekTimeSlots = new Map<string, TimeSlot[]>();

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);

      const dateKey = this.formatDate(date);

      if (serviceId) {
        const timeSlots = this.getAvailableTimeSlotsForDate(
          date,
          serviceId,
          { includeUnavailable: true }
        );
        weekTimeSlots.set(dateKey, timeSlots);
      } else {
        // Get availability for all services combined
        const dayAvailability = this.getDayAvailabilityAllServices(date);
        weekTimeSlots.set(dateKey, dayAvailability.timeSlots);
      }
    }

    return weekTimeSlots;
  }

  /**
   * Preload availability for a date range (optimization)
   */
  async preloadDateRange(
    startDate: Date,
    endDate: Date,
    serviceIds: string[] = []
  ): Promise<void> {
    const services = serviceIds.length > 0
      ? serviceIds
      : this.firebaseServicesService.activeServices().map(s => s.id!);

    const promises: Promise<void>[] = [];

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      for (const serviceId of services) {
        promises.push(
          Promise.resolve(this.getAvailableTimeSlotsForDate(new Date(date), serviceId))
            .then(() => {}) // Convert to void
        );
      }
    }

    await Promise.all(promises);
  }

  // ===== PRIVATE METHODS =====

  private generateTimeSlotsForDateAndService(date: Date, service: FirebaseService): TimeSlot[] {
    return this.bookingValidationService.generateTimeSlotsForService(
      date,
      service.duration,
      this.bookingService.bookings()
    );
  }

  private generateWeekAvailability(
    weekStart: Date,
    serviceId?: string,
    options: DateTimeAvailabilityOptions = {}
  ): WeekAvailability {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const days: DayAvailability[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);

      const dayAvailability = serviceId
        ? this.getDayAvailability(date, serviceId, options)
        : this.getDayAvailabilityAllServices(date, options);

      days.push(dayAvailability);
    }

    return {
      weekStart: new Date(weekStart),
      weekEnd: new Date(weekEnd),
      days
    };
  }

  private getDayAvailabilityAllServices(
    date: Date,
    options: DateTimeAvailabilityOptions = {}
  ): DayAvailability {
    // Check if it's a working day
    const dayOfWeek = date.getDay();
    const isWorkingDay = this.workingDays().includes(dayOfWeek);

    if (!isWorkingDay) {
      return this.createEmptyDayAvailability(date, false);
    }

    // Get availability across all services
    const services = this.firebaseServicesService.activeServices();
    let hasAnyAvailability = false;
    const allTimeSlots: TimeSlot[] = [];

    for (const service of services) {
      if (!service.id) continue;

      const serviceSlots = this.generateTimeSlotsForDateAndService(date, service);
      if (serviceSlots.some(slot => slot.available)) {
        hasAnyAvailability = true;
      }

      // Merge unique time slots
      serviceSlots.forEach(slot => {
        const existing = allTimeSlots.find(s => s.time === slot.time);
        if (!existing) {
          allTimeSlots.push(slot);
        } else if (slot.available && !existing.available) {
          existing.available = true; // If any service has availability, mark as available
        }
      });
    }

    allTimeSlots.sort((a, b) => a.time.localeCompare(b.time));

    return this.createDayAvailability(date, allTimeSlots, isWorkingDay, hasAnyAvailability);
  }

  private createDayAvailability(
    date: Date,
    timeSlots: TimeSlot[],
    isWorkingDay: boolean = true,
    isAvailable?: boolean
  ): DayAvailability {
    const availableSlots = timeSlots.filter(slot => slot.available).length;

    return {
      date: new Date(date),
      isWorkingDay,
      isAvailable: isAvailable !== undefined ? isAvailable : availableSlots > 0,
      timeSlots,
      totalSlots: timeSlots.length,
      availableSlots
    };
  }

  private createEmptyDayAvailability(date: Date, isWorkingDay: boolean): DayAvailability {
    return {
      date: new Date(date),
      isWorkingDay,
      isAvailable: false,
      timeSlots: [],
      totalSlots: 0,
      availableSlots: 0
    };
  }

  private cacheDay(date: Date, serviceId: string, timeSlots: TimeSlot[]): void {
    const cacheKey = this.generateCacheKey(date, serviceId);
    const dayAvailability = this.createDayAvailability(date, timeSlots);

    const cache = new Map(this.availabilityCache());
    cache.set(cacheKey, dayAvailability);
    this.availabilityCache.set(cache);
  }

  private cacheWeek(weekStart: Date, serviceId: string | undefined, weekAvailability: WeekAvailability): void {
    const cacheKey = this.generateWeekCacheKey(weekStart, serviceId);
    const cache = new Map(this.weekCache());
    cache.set(cacheKey, weekAvailability);
    this.weekCache.set(cache);
  }

  private generateCacheKey(date: Date, serviceId: string): string {
    return `${this.formatDate(date)}_${serviceId}`;
  }

  private generateWeekCacheKey(weekStart: Date, serviceId?: string): string {
    const serviceKey = serviceId || 'all_services';
    return `week_${this.formatDate(weekStart)}_${serviceKey}`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private isCacheValid(date: Date): boolean {
    // Cache is valid for current day and future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }

  private isWeekCacheValid(weekStart: Date): boolean {
    // Week cache is valid if the week hasn't passed
    const today = new Date();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return weekEnd >= today;
  }

  private getServiceById(serviceId: string): FirebaseService | null {
    return this.firebaseServicesService.activeServices().find(s => s.id === serviceId) || null;
  }
}
