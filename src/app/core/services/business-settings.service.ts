import { Injectable, signal, computed, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

export interface BusinessSettings {
  businessName: string;
  businessHours: {
    start: number;
    end: number;
    lunchStart: number;
    lunchEnd: number;
  };
  // String format for compatibility with booking components
  businessHoursString?: {
    start: string;
    end: string;
    lunchStart: string;
    lunchEnd: string;
  };
  workingDays: number[];
  appointmentDuration: number;
  maxAppointmentsPerDay: number;
  autoConfirmAppointments: boolean;
  sendNotifications: boolean;
  backupFrequency: string;
  language: string;
  timezone: string;
  currency: string;
  // New booking parameters
  preventCancellation: boolean;
  cancellationTimeLimit: number; // in hours
  bookingAdvanceDays: number; // days in advance bookings can be made
  bookingAdvanceTime: number; // minutes before appointment time that booking is allowed
}

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'PeluApp',
  businessHours: {
    start: 8,
    end: 20,
    lunchStart: 13,
    lunchEnd: 14,
  },
  businessHoursString: {
    start: '08:00',
    end: '20:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
  },
  workingDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
  appointmentDuration: 60,
  maxAppointmentsPerDay: 20,
  autoConfirmAppointments: false,
  sendNotifications: true,
  backupFrequency: 'daily',
  language: 'ca',
  timezone: 'Europe/Madrid',
  currency: 'EUR',
  preventCancellation: false,
  cancellationTimeLimit: 24, // Default to 24 hours
  bookingAdvanceDays: 30, // Default to 30 days (1 month)
  bookingAdvanceTime: 30, // Default to 30 minutes
};

@Injectable({
  providedIn: 'root',
})
export class BusinessSettingsService {
  private readonly firestore = inject(Firestore);

  // Signals for reactive state management
  private readonly settingsSignal = signal<BusinessSettings>(DEFAULT_SETTINGS);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Public computed signals
  readonly settings = computed(() => this.settingsSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  // Convenience computed signals for commonly used settings
  readonly businessName = computed(() => this.settings().businessName);
  readonly businessHours = computed(() => this.settings().businessHours);
  readonly businessHoursString = computed(() => this.settings().businessHoursString || this.convertToTimeString(this.settings().businessHours));
  readonly workingDays = computed(() => this.settings().workingDays);
  readonly appointmentDuration = computed(() => this.settings().appointmentDuration);
  readonly maxAppointmentsPerDay = computed(() => this.settings().maxAppointmentsPerDay);
  readonly autoConfirmAppointments = computed(() => this.settings().autoConfirmAppointments);
  readonly sendNotifications = computed(() => this.settings().sendNotifications);
  readonly language = computed(() => this.settings().language);
  readonly currency = computed(() => this.settings().currency);
  // New booking parameters
  readonly preventCancellation = computed(() => this.settings().preventCancellation);
  readonly cancellationTimeLimit = computed(() => this.settings().cancellationTimeLimit);
  readonly bookingAdvanceDays = computed(() => this.settings().bookingAdvanceDays);
  readonly bookingAdvanceTime = computed(() => this.settings().bookingAdvanceTime);

  // Lunch break computed signals
  readonly lunchBreak = computed(() => ({
    start: this.businessHoursString().lunchStart,
    end: this.businessHoursString().lunchEnd,
  }));

  readonly lunchBreakNumeric = computed(() => ({
    start: this.businessHours().lunchStart,
    end: this.businessHours().lunchEnd,
  }));

  constructor() {
    this.loadSettings();
  }

  /**
   * Convert numeric hours to time string format
   */
  private convertToTimeString(hours: { start: number; end: number; lunchStart: number; lunchEnd: number }) {
    return {
      start: `${hours.start.toString().padStart(2, '0')}:00`,
      end: `${hours.end.toString().padStart(2, '0')}:00`,
      lunchStart: `${hours.lunchStart.toString().padStart(2, '0')}:00`,
      lunchEnd: `${hours.lunchEnd.toString().padStart(2, '0')}:00`,
    };
  }

  /**
   * Convert time string format to numeric hours
   */
  private convertToNumericHours(timeString: { start: string; end: string; lunchStart: string; lunchEnd: string }) {
    return {
      start: parseInt(timeString.start.split(':')[0]),
      end: parseInt(timeString.end.split(':')[0]),
      lunchStart: parseInt(timeString.lunchStart.split(':')[0]),
      lunchEnd: parseInt(timeString.lunchEnd.split(':')[0]),
    };
  }

  /**
   * Load business settings from Firestore
   */
  async loadSettings(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const settingsDoc = doc(this.firestore, 'system', 'settings');
      const settingsSnapshot = await getDoc(settingsDoc);

      if (settingsSnapshot.exists()) {
        const data = settingsSnapshot.data() as BusinessSettings;
        const mergedSettings = { ...DEFAULT_SETTINGS, ...data };

        // Ensure string format is always available
        if (!mergedSettings.businessHoursString) {
          mergedSettings.businessHoursString = this.convertToTimeString(mergedSettings.businessHours);
        }

        this.settingsSignal.set(mergedSettings);
      } else {
        // If no settings exist, create default settings
        await this.saveSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error loading business settings:', error);
      this.errorSignal.set('Error al carregar la configuració del negoci');
      // Fallback to default settings
      this.settingsSignal.set(DEFAULT_SETTINGS);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Save business settings to Firestore
   */
  async saveSettings(settings: Partial<BusinessSettings>): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const settingsDoc = doc(this.firestore, 'system', 'settings');
      const currentSettings = this.settings();
      const updatedSettings = { ...currentSettings, ...settings };

      // Ensure both numeric and string formats are synchronized
      if (updatedSettings.businessHours && !updatedSettings.businessHoursString) {
        updatedSettings.businessHoursString = this.convertToTimeString(updatedSettings.businessHours);
      }
      if (updatedSettings.businessHoursString && !updatedSettings.businessHours) {
        updatedSettings.businessHours = this.convertToNumericHours(updatedSettings.businessHoursString);
      }

      await setDoc(settingsDoc, updatedSettings, { merge: true });
      this.settingsSignal.set(updatedSettings);
    } catch (error) {
      console.error('Error saving business settings:', error);
      this.errorSignal.set('Error al desar la configuració del negoci');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update specific business settings
   */
  async updateSettings(updates: Partial<BusinessSettings>): Promise<void> {
    await this.saveSettings(updates);
  }

  /**
   * Update business hours (numeric format)
   */
  async updateBusinessHours(hours: { start: number; end: number; lunchStart: number; lunchEnd: number }): Promise<void> {
    await this.saveSettings({
      businessHours: hours,
      businessHoursString: this.convertToTimeString(hours),
    });
  }

  /**
   * Update business hours (string format)
   */
  async updateBusinessHoursString(hours: { start: string; end: string; lunchStart: string; lunchEnd: string }): Promise<void> {
    await this.saveSettings({
      businessHoursString: hours,
      businessHours: this.convertToNumericHours(hours),
    });
  }

  /**
   * Update lunch break settings
   */
  async updateLunchBreak(lunchBreak: { start: string; end: string }): Promise<void> {
    const currentHours = this.businessHoursString();
    const updatedHours = {
      ...currentHours,
      lunchStart: lunchBreak.start,
      lunchEnd: lunchBreak.end,
    };

    await this.updateBusinessHoursString(updatedHours);
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(): Promise<void> {
    await this.saveSettings(DEFAULT_SETTINGS);
  }

  /**
   * Get business name for use in titles and headers
   */
  getBusinessName(): string {
    return this.businessName();
  }

  /**
   * Get business hours configuration (numeric format)
   */
  getBusinessHours() {
    return this.businessHours();
  }

  /**
   * Get business hours configuration (string format)
   */
  getBusinessHoursString() {
    return this.businessHoursString();
  }

  /**
   * Get lunch break configuration (string format)
   */
  getLunchBreak() {
    return this.lunchBreak();
  }

  /**
   * Get lunch break configuration (numeric format)
   */
  getLunchBreakNumeric() {
    return this.lunchBreakNumeric();
  }

  /**
   * Get working days configuration
   */
  getWorkingDays(): number[] {
    return this.workingDays();
  }

  /**
   * Check if a specific day is a working day
   */
  isWorkingDay(dayOfWeek: number): boolean {
    return this.workingDays().includes(dayOfWeek);
  }

  /**
   * Get appointment duration in minutes
   */
  getAppointmentDuration(): number {
    return this.appointmentDuration();
  }

  /**
   * Get maximum appointments per day
   */
  getMaxAppointmentsPerDay(): number {
    return this.maxAppointmentsPerDay();
  }

  /**
   * Check if appointments should be auto-confirmed
   */
  shouldAutoConfirmAppointments(): boolean {
    return this.autoConfirmAppointments();
  }

  /**
   * Check if notifications should be sent
   */
  shouldSendNotifications(): boolean {
    return this.sendNotifications();
  }

  /**
   * Check if cancellation is prevented
   */
  isCancellationPrevented(): boolean {
    return this.settings().preventCancellation;
  }

  /**
   * Get cancellation time limit in hours
   */
  getCancellationTimeLimit(): number {
    return this.settings().cancellationTimeLimit;
  }

  /**
   * Get booking advance days limit
   */
  getBookingAdvanceDays(): number {
    return this.settings().bookingAdvanceDays;
  }

  /**
   * Get booking advance time limit in minutes
   */
  getBookingAdvanceTime(): number {
    return this.settings().bookingAdvanceTime;
  }

  /**
   * Get current language setting
   */
  getLanguage(): string {
    return this.language();
  }

  /**
   * Get current currency setting
   */
  getCurrency(): string {
    return this.currency();
  }

  /**
   * Check if a time is during lunch break
   */
  isLunchBreak(time: string): boolean {
    const [hour] = time.split(':').map(Number);
    const lunchBreak = this.lunchBreakNumeric();
    return hour >= lunchBreak.start && hour < lunchBreak.end;
  }
}
