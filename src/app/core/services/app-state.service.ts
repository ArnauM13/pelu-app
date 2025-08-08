import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { SystemParametersService } from './system-parameters.service';
import { BookingService } from './booking.service';
import { ToastService } from '../../shared/services/toast.service';
import { RoleService } from './role.service';

export interface AppState {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // User state
  currentUser: unknown;
  userRole: string | null;

  // Data state
  hasAppointments: boolean;
  appointmentCount: number;
  hasServices: boolean;
  serviceCount: number;

  // UI state
  isMobile: boolean;
  currentRoute: string;
  showLoader: boolean;

  // Business state
  businessName: string;
  businessHours: unknown;
  preventCancellation: boolean;
  cancellationTimeLimit: number;
  bookingAdvanceDays: number;
  bookingAdvanceTime: number;

  // Toast state
  activeToasts: number;
  hasRecentToasts: boolean;
}

export interface AppStats {
  totalAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  totalServices: number;
  activeServices: number;
  userCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);
  private readonly bookingService = inject(BookingService);
  private readonly systemParametersService = inject(SystemParametersService);
  private readonly toastService = inject(ToastService);

  // Internal state signals
  private readonly appStateSignal = signal<AppState>({
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
    currentUser: null,
    userRole: null,
    hasAppointments: false,
    appointmentCount: 0,
    hasServices: false,
    serviceCount: 0,
    isMobile: false,
    currentRoute: '',
    showLoader: false,
    businessName: 'PeluApp',
    businessHours: { start: 8, end: 20 },
    preventCancellation: false,
    cancellationTimeLimit: 24,
    bookingAdvanceDays: 30,
    bookingAdvanceTime: 30,
    activeToasts: 0,
    hasRecentToasts: false,
  });

  private readonly appStatsSignal = signal<AppStats>({
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    totalServices: 0,
    activeServices: 0,
    userCount: 0,
  });

  // Public computed signals
  readonly appState = computed(() => this.appStateSignal());
  readonly appStats = computed(() => this.appStatsSignal());

  // Authentication state
  readonly isAuthenticated = computed(() => this.appState().isAuthenticated);
  readonly isLoading = computed(() => this.appState().isLoading);
  readonly isInitialized = computed(() => this.appState().isInitialized);

  // User state
  readonly currentUser = computed(() => this.appState().currentUser);
  readonly userRole = computed(() => this.appState().userRole);

  // Data state
  readonly hasAppointments = computed(() => this.appState().hasAppointments);
  readonly appointmentCount = computed(() => this.appState().appointmentCount);
  readonly hasServices = computed(() => this.appState().hasServices);
  readonly serviceCount = computed(() => this.appState().serviceCount);

  // UI state
  readonly isMobile = computed(() => this.appState().isMobile);
  readonly currentRoute = computed(() => this.appState().currentRoute);
  readonly showLoader = computed(() => this.appState().showLoader);

  // Business state
  readonly businessName = computed(() => this.appState().businessName);
  readonly businessHours = computed(() => this.appState().businessHours);
  readonly preventCancellation = computed(() => this.appState().preventCancellation);
  readonly cancellationTimeLimit = computed(() => this.appState().cancellationTimeLimit);
  readonly bookingAdvanceDays = computed(() => this.appState().bookingAdvanceDays);
  readonly bookingAdvanceTime = computed(() => this.appState().bookingAdvanceTime);

  // Toast state
  readonly activeToasts = computed(() => this.appState().activeToasts);
  readonly hasRecentToasts = computed(() => this.appState().hasRecentToasts);

  // Computed convenience signals
  readonly isReady = computed(() =>
    this.isInitialized() && !this.isLoading()
  );

  readonly canAccessAppointments = computed(() =>
    this.isAuthenticated() && this.userRole() === 'admin'
  );

  readonly canManageServices = computed(() =>
    this.isAuthenticated() && this.userRole() === 'admin'
  );

  readonly hasData = computed(() =>
    this.hasAppointments() || this.hasServices()
  );

  readonly isBusinessOpen = computed(() => {
    const hours = this.businessHours();
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= hours.start && currentHour < hours.end;
  });

  constructor() {
    this.initializeStateSync();
  }

  private initializeStateSync() {
    // Sync authentication state
    effect(() => {
      const authState = {
        isAuthenticated: this.authService.isAuthenticated(),
        isLoading: this.authService.isLoading(),
        isInitialized: this.authService.isInitialized(),
        currentUser: this.authService.user(),
      };

      this.updateAuthState(authState);
    });

    // Sync user state
    effect(() => {
      this.updateUserState({
        userRole: this.roleService.userRole()?.role || null
      });
    });

    // Sync appointments state
    effect(() => {
      const appointments = this.bookingService.bookings();
      const appointmentState = {
        hasAppointments: appointments.length > 0,
        appointmentCount: appointments.length,
      };

      this.updateAppointmentState(appointmentState);
    });

    // Sync business settings
    effect(() => {
      const settings = this.systemParametersService.settings();
      const businessState = {
        businessName: settings.businessName,
        businessHours: settings.businessHours,
        preventCancellation: settings.preventCancellation,
        cancellationTimeLimit: settings.cancellationTimeLimit,
        bookingAdvanceDays: settings.bookingAdvanceDays,
        bookingAdvanceTime: settings.bookingAdvanceTime,
      };

      this.updateBusinessState(businessState);
    });

    // Sync toast state
    effect(() => {
      const toastState = {
        activeToasts: this.toastService.activeToasts(),
        hasRecentToasts: this.toastService.hasRecentToasts(),
      };

      this.updateToastState(toastState);
    });
  }

  private updateAuthState(authState: Partial<AppState>) {
    this.appStateSignal.update(state => ({
      ...state,
      ...authState,
    }));
  }

  private updateUserState(userState: Partial<AppState>) {
    this.appStateSignal.update(state => ({
      ...state,
      ...userState,
    }));
  }

  private updateAppointmentState(appointmentState: Partial<AppState>) {
    this.appStateSignal.update(state => ({
      ...state,
      ...appointmentState,
    }));
  }

  private updateBusinessState(businessState: Partial<AppState>) {
    this.appStateSignal.update(state => ({
      ...state,
      ...businessState,
    }));
  }

  private updateToastState(toastState: Partial<AppState>) {
    this.appStateSignal.update(state => ({
      ...state,
      ...toastState,
    }));
  }

  // Public methods for manual state updates
  setMobileState(isMobile: boolean) {
    this.appStateSignal.update(state => ({
      ...state,
      isMobile,
    }));
  }

  setCurrentRoute(route: string) {
    this.appStateSignal.update(state => ({
      ...state,
      currentRoute: route,
    }));
  }

  setShowLoader(show: boolean) {
    this.appStateSignal.update(state => ({
      ...state,
      showLoader: show,
    }));
  }

  // Stats calculation methods
  updateAppStats() {
    const appointments = this.bookingService.bookings();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const stats: AppStats = {
      totalAppointments: appointments.length,
      todayAppointments: appointments.filter(a => a.data === today).length,
      upcomingAppointments: appointments.filter(a => {
        const appointmentDate = new Date(a.data + 'T' + (a.hora || '23:59'));
        return appointmentDate > now;
      }).length,
      totalServices: 0, // TODO: Get from services service
      activeServices: 0, // TODO: Get from services service
      userCount: 0, // TODO: Get from user service
    };

    this.appStatsSignal.set(stats);
  }

  // Utility methods
  getStateSnapshot(): AppState {
    return this.appState();
  }

  getStatsSnapshot(): AppStats {
    return this.appStats();
  }

  // Debug method
  logCurrentState() {
    console.log('Current App State:', this.appState());
    console.log('Current App Stats:', this.appStats());
  }
}
