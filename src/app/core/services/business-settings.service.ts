import { Injectable, signal, computed, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';

export interface BusinessSettings {
  businessName: string;
  businessHours: {
    start: number;
    end: number;
    lunchStart: number;
    lunchEnd: number;
  };
  workingDays: number[];
  appointmentDuration: number;
  maxAppointmentsPerDay: number;
  autoConfirmAppointments: boolean;
  sendNotifications: boolean;
  maintenanceMode: boolean;
  backupFrequency: string;
  language: string;
  timezone: string;
  currency: string;
}

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'PeluApp',
  businessHours: {
    start: 8,
    end: 20,
    lunchStart: 13,
    lunchEnd: 14
  },
  workingDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
  appointmentDuration: 60,
  maxAppointmentsPerDay: 20,
  autoConfirmAppointments: false,
  sendNotifications: true,
  maintenanceMode: false,
  backupFrequency: 'daily',
  language: 'ca',
  timezone: 'Europe/Madrid',
  currency: 'EUR'
};

@Injectable({
  providedIn: 'root'
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
  readonly workingDays = computed(() => this.settings().workingDays);
  readonly appointmentDuration = computed(() => this.settings().appointmentDuration);
  readonly maxAppointmentsPerDay = computed(() => this.settings().maxAppointmentsPerDay);
  readonly autoConfirmAppointments = computed(() => this.settings().autoConfirmAppointments);
  readonly sendNotifications = computed(() => this.settings().sendNotifications);
  readonly maintenanceMode = computed(() => this.settings().maintenanceMode);
  readonly language = computed(() => this.settings().language);
  readonly currency = computed(() => this.settings().currency);

  constructor() {
    this.loadSettings();
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
        this.settingsSignal.set({ ...DEFAULT_SETTINGS, ...data });
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
   * Get business hours configuration
   */
  getBusinessHours() {
    return this.businessHours();
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
   * Check if maintenance mode is enabled
   */
  isMaintenanceMode(): boolean {
    return this.maintenanceMode();
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
}
