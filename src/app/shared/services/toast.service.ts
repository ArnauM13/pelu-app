import { Injectable, inject, signal, computed } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastConfig, ToastData } from '../components/toast/toast.component';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warn' | 'secondary' | 'contrast';

export interface ToastState {
  messages: ToastConfig[];
  isVisible: boolean;
  activeToasts: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly messageService = inject(MessageService);
  private readonly defaultToastKey = 'pelu-toast';

  // Internal state signals
  private readonly toastStateSignal = signal<ToastState>({
    messages: [],
    isVisible: false,
    activeToasts: 0,
  });

  private readonly toastHistorySignal = signal<ToastConfig[]>([]);
  private readonly maxHistorySize = 50;

  // Public computed signals
  readonly toastState = computed(() => this.toastStateSignal());
  readonly activeToasts = computed(() => this.toastState().activeToasts);
  readonly isVisible = computed(() => this.toastState().isVisible);
  readonly toastHistory = computed(() => this.toastHistorySignal());
  readonly hasActiveToasts = computed(() => this.activeToasts() > 0);
  readonly recentToasts = computed(() =>
    this.toastHistory().slice(-5).reverse()
  );

  // Toast statistics
  readonly toastStats = computed(() => {
    const history = this.toastHistory();
    return {
      total: history.length,
      success: history.filter(t => t.severity === 'success').length,
      error: history.filter(t => t.severity === 'error').length,
      info: history.filter(t => t.severity === 'info').length,
      warning: history.filter(t => t.severity === 'warn').length,
    };
  });

  showToast(config: ToastConfig) {
    const defaultConfig: Partial<ToastConfig> = {
      life: 4000,
      sticky: false,
      closable: true,
      position: 'top-right',
      key: this.defaultToastKey,
      data: {},
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Update internal state
    this.updateToastState(finalConfig);

    // Add to history
    this.addToHistory(finalConfig);

    this.messageService.add({
      severity: finalConfig.severity,
      summary: finalConfig.summary,
      detail: finalConfig.detail || '',
      life: finalConfig.life,
      sticky: finalConfig.sticky,
      closable: finalConfig.closable,
      key: finalConfig.key,
      data: finalConfig.data,
    });
  }

  private updateToastState(config: ToastConfig) {
    const currentState = this.toastStateSignal();
    const newMessages = [...currentState.messages, config];

    this.toastStateSignal.set({
      messages: newMessages,
      isVisible: true,
      activeToasts: currentState.activeToasts + 1,
    });
  }

  private addToHistory(config: ToastConfig) {
    const currentHistory = this.toastHistorySignal();
    const newHistory = [...currentHistory, config];

    // Keep only the last maxHistorySize items
    if (newHistory.length > this.maxHistorySize) {
      newHistory.splice(0, newHistory.length - this.maxHistorySize);
    }

    this.toastHistorySignal.set(newHistory);
  }

  // Quick helper methods
  showSuccess(summary: string, detail?: string, data?: ToastData) {
    this.showToast({
      severity: 'success',
      summary,
      detail,
      data,
    });
  }

  showError(summary: string, detail?: string, data?: ToastData) {
    this.showToast({
      severity: 'error',
      summary,
      detail,
      data,
    });
  }

  showInfo(summary: string, detail?: string, data?: ToastData) {
    this.showToast({
      severity: 'info',
      summary,
      detail,
      data,
    });
  }

  showWarning(summary: string, detail?: string, data?: ToastData) {
    this.showToast({
      severity: 'warn',
      summary,
      detail,
      data,
    });
  }

  showSecondary(summary: string, detail?: string, data?: ToastData) {
    this.showToast({
      severity: 'secondary',
      summary,
      detail,
      data,
    });
  }

  showContrast(summary: string, detail?: string, data?: ToastData) {
    this.showToast({
      severity: 'contrast',
      summary,
      detail,
      data,
    });
  }

  // Specific use cases
  showReservationCreated(appointmentId?: string) {
    this.showToast({
      severity: 'success',
      summary: 'Cita creada',
      detail: 'La teva cita s\'ha creat correctament',
      data: {
        appointmentId,
        showViewButton: true,
        actionLabel: 'Veure cita',
      },
    });
  }

  showAppointmentDeleted(appointmentName?: string) {
    this.showToast({
      severity: 'info',
      summary: 'Cita eliminada',
      detail: appointmentName
        ? `La cita de ${appointmentName} s'ha eliminat correctament`
        : 'La cita s\'ha eliminat correctament',
    });
  }

  showAppointmentUpdated(appointmentName?: string) {
    this.showToast({
      severity: 'success',
      summary: 'Cita actualitzada',
      detail: appointmentName
        ? `La cita de ${appointmentName} s'ha actualitzat correctament`
        : 'La cita s\'ha actualitzat correctament',
    });
  }

  showAppointmentCreated(appointmentName?: string, appointmentId?: string) {
    this.showToast({
      severity: 'success',
      summary: 'Cita creada',
      detail: appointmentName
        ? `La cita de ${appointmentName} s'ha creat correctament`
        : 'La cita s\'ha creat correctament',
      data: {
        appointmentId,
        showViewButton: true,
        actionLabel: 'Veure cita',
      },
    });
  }

  showValidationError(message: string) {
    this.showToast({
      severity: 'error',
      summary: 'Error de validació',
      detail: message,
    });
  }

  showNetworkError() {
    this.showToast({
      severity: 'error',
      summary: 'Error de connexió',
      detail: 'No s\'ha pogut connectar amb el servidor. Si us plau, torna-ho a provar.',
    });
  }

  showUnauthorizedError() {
    this.showToast({
      severity: 'error',
      summary: 'Accés denegat',
      detail: 'No tens permisos per realitzar aquesta acció.',
    });
  }

  showLoginRequired() {
    this.showToast({
      severity: 'warn',
      summary: 'Inici de sessió requerit',
      detail: 'Has d\'iniciar sessió per realitzar aquesta acció.',
    });
  }

  showGenericSuccess(message: string) {
    this.showToast({
      severity: 'success',
      summary: 'Èxit',
      detail: message,
    });
  }

  showGenericError(message: string) {
    this.showToast({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  showGenericInfo(message: string) {
    this.showToast({
      severity: 'info',
      summary: 'Informació',
      detail: message,
    });
  }

  showGenericWarning(message: string) {
    this.showToast({
      severity: 'warn',
      summary: 'Advertència',
      detail: message,
    });
  }

  showStickyToast(config: ToastConfig) {
    this.showToast({ ...config, sticky: true });
  }

  showToastWithCustomIcon(config: ToastConfig, icon: string) {
    this.showToast({
      ...config,
      data: { ...config.data, customIcon: icon },
    });
  }

  showToastWithCustomClass(config: ToastConfig, customClass: string) {
    this.showToast({
      ...config,
      data: { ...config.data, customClass },
    });
  }

  showToastAtPosition(
    config: ToastConfig,
    position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center'
  ) {
    this.showToast({ ...config, position });
  }

  showMultipleToasts(configs: ToastConfig[]) {
    configs.forEach(config => this.showToast(config));
  }

  showToastWithDuration(config: ToastConfig, duration: number) {
    this.showToast({ ...config, life: duration });
  }

  showToastWithAction(
    config: ToastConfig,
    action: () => void,
    actionLabel: string = 'Acció'
  ) {
    this.showToast({
      ...config,
      data: { ...config.data, action, actionLabel },
    });
  }

  clearToast(key?: string) {
    this.messageService.clear(key || this.defaultToastKey);

    // Update internal state
    const currentState = this.toastStateSignal();
    this.toastStateSignal.set({
      ...currentState,
      activeToasts: Math.max(0, currentState.activeToasts - 1),
      isVisible: currentState.activeToasts > 1,
    });
  }

  clearAllToasts() {
    this.messageService.clear();

    // Reset internal state
    this.toastStateSignal.set({
      messages: [],
      isVisible: false,
      activeToasts: 0,
    });
  }

  // New methods for signal-based functionality
  clearHistory() {
    this.toastHistorySignal.set([]);
  }

  getToastStats() {
    return this.toastStats();
  }

  hasRecentToasts() {
    return this.recentToasts().length > 0;
  }
}
