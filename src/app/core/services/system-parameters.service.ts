import { Injectable, signal, computed, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { RoleService } from './role.service';

/**
 * Interfície pels paràmetres del sistema
 * Segueix el principi de Single Responsibility (SRP)
 */
export interface SystemParameters {
  // Informació del negoci
  businessName: string;
  businessHours: {
    start: number;
    end: number;
    lunchStart: number;
    lunchEnd: number;
  };
  workingDays: number[];

  // Configuració de reserves
  appointmentDuration: number;
  maxAppointmentsPerUser: number;
  autoConfirmAppointments: boolean;
  sendNotifications: boolean;

  // Paràmetres de reserva
  preventCancellation: boolean;
  cancellationTimeLimit: number; // en hores
  bookingAdvanceDays: number; // dies d'antelació
  bookingAdvanceTime: number; // minuts abans de l'hora

  // Configuració del sistema
  language: string;
  currency: string;
}

/**
 * Valors per defecte dels paràmetres
 * Segueix el principi de Open/Closed (OCP)
 */
const DEFAULT_PARAMETERS: SystemParameters = {
  businessName: 'PeluApp',
  businessHours: {
    start: 8,
    end: 20,
    lunchStart: 13,
    lunchEnd: 15,
  },
  workingDays: [2, 3, 4, 5, 6], // Dimarts a Dissabte
  appointmentDuration: 30,
  maxAppointmentsPerUser: 1,
  autoConfirmAppointments: true,
  sendNotifications: true,
  preventCancellation: false,
  cancellationTimeLimit: 1,
  bookingAdvanceDays: 30,
  bookingAdvanceTime: 30,
  language: 'ca',
  currency: 'EUR',
};

/**
 * Servei centralitzat per gestionar els paràmetres del sistema
 * Segueix principis SOLID i Angular 20
 *
 * Single Responsibility: Gestiona només els paràmetres del sistema
 * Open/Closed: Extensible sense modificar codi existent
 * Liskov Substitution: Implementa interfícies clares
 * Interface Segregation: Interfícies específiques
 * Dependency Inversion: Depèn d'abstraccions
 */
@Injectable({
  providedIn: 'root',
})
export class SystemParametersService {
  private readonly firestore = inject(Firestore);
  private readonly roleService = inject(RoleService);

  // Signals per gestió reactiva d'estat (Angular 20)
  private readonly parametersSignal = signal<SystemParameters>(DEFAULT_PARAMETERS);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly lastSyncSignal = signal<number>(0);

  // Computed signals públics
  readonly parameters = computed(() => this.parametersSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly lastSync = computed(() => this.lastSyncSignal());

  // Computed signals per paràmetres específics (Interface Segregation)
  readonly businessName = computed(() => this.parameters().businessName);
  readonly businessHours = computed(() => this.parameters().businessHours);
  readonly workingDays = computed(() => this.parameters().workingDays);
  readonly appointmentDuration = computed(() => this.parameters().appointmentDuration);
  readonly maxAppointmentsPerUser = computed(() => this.parameters().maxAppointmentsPerUser);
  readonly autoConfirmAppointments = computed(() => this.parameters().autoConfirmAppointments);
  readonly sendNotifications = computed(() => this.parameters().sendNotifications);
  readonly preventCancellation = computed(() => this.parameters().preventCancellation);
  readonly cancellationTimeLimit = computed(() => this.parameters().cancellationTimeLimit);
  readonly bookingAdvanceDays = computed(() => this.parameters().bookingAdvanceDays);
  readonly bookingAdvanceTime = computed(() => this.parameters().bookingAdvanceTime);
  readonly language = computed(() => this.parameters().language);
  readonly currency = computed(() => this.parameters().currency);

  // Computed signals derivats
  readonly lunchBreak = computed(() => ({
    start: this.businessHours().lunchStart,
    end: this.businessHours().lunchEnd,
  }));

  // Alias per compatibilitat amb codi existent
  readonly settings = computed(() => this.parametersSignal());

  constructor() {
    this.initializeParameters();
  }

  /**
   * Inicialitza els paràmetres del sistema
   * Carrega sempre des del Firebase sense distinció entre admin i user
   */
  private async initializeParameters(): Promise<void> {
    try {
      await this.loadParameters();
    } catch (error) {
      console.error('Error inicialitzant paràmetres del sistema:', error);
      // Fallback als valors per defecte
      this.parametersSignal.set(DEFAULT_PARAMETERS);
    }
  }

  /**
   * Carrega els paràmetres des del Firebase
   * Única font de veritat - no hi ha mockeig local
   */
  async loadParameters(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const settingsDoc = doc(this.firestore, 'system', 'settings');
      const settingsSnapshot = await getDoc(settingsDoc);

      if (settingsSnapshot.exists()) {
        const data = settingsSnapshot.data() as SystemParameters;
        const mergedParameters = { ...DEFAULT_PARAMETERS, ...data };

        this.parametersSignal.set(mergedParameters);
        this.lastSyncSignal.set(Date.now());
      } else {
        // Els paràmetres sempre han d'existir, utilitzar valors per defecte
        this.parametersSignal.set(DEFAULT_PARAMETERS);
        this.lastSyncSignal.set(Date.now());
      }
    } catch (error) {
      console.error('Error carregant paràmetres del sistema:', error);
      this.errorSignal.set('Error al carregar els paràmetres del sistema');
      // Fallback als valors per defecte
      this.parametersSignal.set(DEFAULT_PARAMETERS);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Desa els paràmetres al Firebase
   * Només accessible per administradors
   */
  async saveParameters(parameters: Partial<SystemParameters>): Promise<void> {
    // Verificar que l'usuari és administrador
    if (!this.roleService.isAdmin()) {
      throw new Error('Només els administradors poden modificar els paràmetres del sistema');
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const settingsDoc = doc(this.firestore, 'system', 'settings');
      const currentParameters = this.parameters();
      const updatedParameters = {
        ...currentParameters,
        ...parameters
      };

      await setDoc(settingsDoc, updatedParameters, { merge: true });
      this.parametersSignal.set(updatedParameters);
      this.lastSyncSignal.set(Date.now());

      // Dispatch event to notify components about parameter updates
      window.dispatchEvent(new CustomEvent('systemParametersUpdated'));
    } catch (error) {
      console.error('Error desant paràmetres del sistema:', error);
      this.errorSignal.set('Error al desar els paràmetres del sistema');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Actualitza paràmetres específics
   */
  async updateParameters(updates: Partial<SystemParameters>): Promise<void> {
    await this.saveParameters(updates);
  }

  /**
   * Actualitza les hores del negoci (format numèric)
   */
  async updateBusinessHours(hours: { start: number; end: number; lunchStart: number; lunchEnd: number }): Promise<void> {
    await this.saveParameters({
      businessHours: hours,
    });
  }

  /**
   * Actualitza la pausa per dinar
   */
  async updateLunchBreak(lunchBreak: { start: number; end: number }): Promise<void> {
    const currentHours = this.businessHours();
    const updatedHours = {
      ...currentHours,
      lunchStart: lunchBreak.start,
      lunchEnd: lunchBreak.end,
    };

    await this.saveParameters({
      businessHours: updatedHours,
    });
  }

  /**
   * Restaura els paràmetres als valors per defecte
   */
  async resetToDefaults(): Promise<void> {
    await this.saveParameters(DEFAULT_PARAMETERS);
  }



  // Mètodes de conveniència per accés directe
  getBusinessName(): string {
    return this.businessName();
  }

  getBusinessHours() {
    return this.businessHours();
  }

  getLunchBreak() {
    return this.lunchBreak();
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

  getMaxAppointmentsPerUser(): number {
    return this.maxAppointmentsPerUser();
  }

  shouldAutoConfirmAppointments(): boolean {
    return this.autoConfirmAppointments();
  }

  shouldSendNotifications(): boolean {
    return this.sendNotifications();
  }

  isCancellationPrevented(): boolean {
    return this.preventCancellation();
  }

  getCancellationTimeLimit(): number {
    return this.cancellationTimeLimit();
  }

  getBookingAdvanceDays(): number {
    return this.bookingAdvanceDays();
  }

  getBookingAdvanceTime(): number {
    return this.bookingAdvanceTime();
  }

  getLanguage(): string {
    return this.language();
  }

  getCurrency(): string {
    return this.currency();
  }

  isLunchBreak(time: string): boolean {
    const [hour] = time.split(':').map(Number);
    const lunchBreak = this.lunchBreak();
    return hour >= lunchBreak.start && hour < lunchBreak.end;
  }

  /**
   * Verifica si els paràmetres estan actualitzats
   */
  isParametersStale(maxAgeMinutes: number = 5): boolean {
    const lastSync = this.lastSync();
    const now = Date.now();
    const maxAgeMs = maxAgeMinutes * 60 * 1000;
    return (now - lastSync) > maxAgeMs;
  }

  /**
   * Força una recàrrega dels paràmetres
   */
  async refreshParameters(): Promise<void> {
    await this.loadParameters();
  }
}
