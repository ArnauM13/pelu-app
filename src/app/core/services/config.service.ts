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

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
  decimalPlaces: number;
}

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'PeluApp',
  businessHours: {
    start: 8,
    end: 20,
    lunchStart: 13,
    lunchEnd: 14,
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
  currency: 'EUR',
};

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly firestore = inject(Firestore);

  // Business settings signals
  private readonly settingsSignal = signal<BusinessSettings>(DEFAULT_SETTINGS);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Currency signals
  private readonly currentCurrencySignal = signal<string>('EUR');

  // Public computed signals for business settings
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

  // Currency information mapping
  private readonly currencies: Record<string, CurrencyInfo> = {
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', position: 'after', decimalPlaces: 2 },
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', position: 'before', decimalPlaces: 2 },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound', position: 'before', decimalPlaces: 2 },
    CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', position: 'before', decimalPlaces: 2 },
    SEK: { code: 'SEK', symbol: 'SEK', name: 'Swedish Krona', position: 'after', decimalPlaces: 2 },
    NOK: {
      code: 'NOK',
      symbol: 'NOK',
      name: 'Norwegian Krone',
      position: 'after',
      decimalPlaces: 2,
    },
    DKK: { code: 'DKK', symbol: 'DKK', name: 'Danish Krone', position: 'after', decimalPlaces: 2 },
    PLN: { code: 'PLN', symbol: 'PLN', name: 'Polish Złoty', position: 'after', decimalPlaces: 2 },
    HUF: {
      code: 'HUF',
      symbol: 'HUF',
      name: 'Hungarian Forint',
      position: 'after',
      decimalPlaces: 0,
    },
    RON: { code: 'RON', symbol: 'RON', name: 'Romanian Leu', position: 'after', decimalPlaces: 2 },
    BGN: { code: 'BGN', symbol: 'BGN', name: 'Bulgarian Lev', position: 'after', decimalPlaces: 2 },
    HRK: { code: 'HRK', symbol: 'HRK', name: 'Croatian Kuna', position: 'after', decimalPlaces: 2 },
    MAD: {
      code: 'MAD',
      symbol: 'MAD',
      name: 'Moroccan Dirham',
      position: 'after',
      decimalPlaces: 2,
    },
    DZD: {
      code: 'DZD',
      symbol: 'DZD',
      name: 'Algerian Dinar',
      position: 'after',
      decimalPlaces: 2,
    },
    TND: {
      code: 'TND',
      symbol: 'TND',
      name: 'Tunisian Dinar',
      position: 'after',
      decimalPlaces: 3,
    },
    EGP: {
      code: 'EGP',
      symbol: 'EGP',
      name: 'Egyptian Pound',
      position: 'after',
      decimalPlaces: 2,
    },
  };

  constructor() {
    this.loadSettings();
  }

  // ===== BUSINESS SETTINGS METHODS =====

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
        // Update currency if it exists in settings
        if (data.currency) {
          this.currentCurrencySignal.set(data.currency);
        }
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

      // Update currency if it was changed
      if (settings.currency && settings.currency !== this.getCurrentCurrency()) {
        this.currentCurrencySignal.set(settings.currency);
      }
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

  // Business settings convenience methods
  getBusinessName(): string {
    return this.businessName();
  }

  getBusinessHours() {
    return this.businessHours();
  }

  getWorkingDays(): number[] {
    return this.workingDays();
  }

  isWorkingDay(dayOfWeek: number): boolean {
    return this.workingDays().includes(dayOfWeek);
  }

  getAppointmentDuration(): number {
    return this.appointmentDuration();
  }

  getMaxAppointmentsPerDay(): number {
    return this.maxAppointmentsPerDay();
  }

  shouldAutoConfirmAppointments(): boolean {
    return this.autoConfirmAppointments();
  }

  shouldSendNotifications(): boolean {
    return this.sendNotifications();
  }

  isMaintenanceMode(): boolean {
    return this.maintenanceMode();
  }

  getLanguage(): string {
    return this.language();
  }

  // ===== CURRENCY METHODS =====

  /**
   * Get current currency
   */
  getCurrentCurrency(): string {
    return this.currentCurrencySignal();
  }

  /**
   * Set current currency
   */
  setCurrentCurrency(currency: string): void {
    if (this.currencies[currency]) {
      this.currentCurrencySignal.set(currency);
      // Also update the business settings
      this.saveSettings({ currency });
    }
  }

  /**
   * Get currency information
   */
  getCurrencyInfo(currencyCode: string): CurrencyInfo | undefined {
    return this.currencies[currencyCode];
  }

  /**
   * Get current currency information
   */
  getCurrentCurrencyInfo(): CurrencyInfo {
    const currentCurrency = this.getCurrentCurrency();
    return this.currencies[currentCurrency] || this.currencies['EUR'];
  }

  /**
   * Get all available currencies
   */
  getCurrencyOptions(): { label: string; value: string }[] {
    return Object.values(this.currencies).map(currency => ({
      label: `${currency.name} (${currency.symbol})`,
      value: currency.code,
    }));
  }

  /**
   * Format price with current currency
   */
  formatPrice(price: number): string {
    const currencyInfo = this.getCurrentCurrencyInfo();
    const formattedPrice = price.toFixed(currencyInfo.decimalPlaces);

    if (currencyInfo.position === 'before') {
      return `${currencyInfo.symbol}${formattedPrice}`;
    } else {
      return `${formattedPrice}${currencyInfo.symbol}`;
    }
  }

  /**
   * Format price with specific currency
   */
  formatPriceWithCurrency(price: number, currencyCode: string): string {
    const currencyInfo = this.getCurrencyInfo(currencyCode);
    if (!currencyInfo) {
      return this.formatPrice(price);
    }

    const formattedPrice = price.toFixed(currencyInfo.decimalPlaces);

    if (currencyInfo.position === 'before') {
      return `${currencyInfo.symbol}${formattedPrice}`;
    } else {
      return `${formattedPrice}${currencyInfo.symbol}`;
    }
  }
}
