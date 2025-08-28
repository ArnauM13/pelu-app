import { Injectable, inject, signal, computed } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
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
  private readonly translateService = inject(TranslateService);
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

  // Quick helper methods - now accept translation keys
  showSuccess(summaryKey: string, detailKey?: string, data?: ToastData) {
    this.showToast({
      severity: 'success',
      summary: this.translateService.instant(summaryKey),
      detail: detailKey ? this.translateService.instant(detailKey) : undefined,
      data,
    });
  }

  showError(summaryKey: string, detailKey?: string, data?: ToastData) {
    this.showToast({
      severity: 'error',
      summary: this.translateService.instant(summaryKey),
      detail: detailKey ? this.translateService.instant(detailKey) : undefined,
      data,
    });
  }

  showInfo(summaryKey: string, detailKey?: string, data?: ToastData) {
    this.showToast({
      severity: 'info',
      summary: this.translateService.instant(summaryKey),
      detail: detailKey ? this.translateService.instant(detailKey) : undefined,
      data,
    });
  }

  showWarning(summaryKey: string, detailKey?: string, data?: ToastData) {
    this.showToast({
      severity: 'warn',
      summary: this.translateService.instant(summaryKey),
      detail: detailKey ? this.translateService.instant(detailKey) : undefined,
      data,
    });
  }

  showSecondary(summaryKey: string, detailKey?: string, data?: ToastData) {
    this.showToast({
      severity: 'secondary',
      summary: this.translateService.instant(summaryKey),
      detail: detailKey ? this.translateService.instant(detailKey) : undefined,
      data,
    });
  }

  showContrast(summaryKey: string, detailKey?: string, data?: ToastData) {
    this.showToast({
      severity: 'contrast',
      summary: this.translateService.instant(summaryKey),
      detail: detailKey ? this.translateService.instant(detailKey) : undefined,
      data,
    });
  }

  // Specific use cases - updated to use translation keys
  showReservationCreated(appointmentId?: string) {
    this.showToast({
      severity: 'success',
      summary: this.translateService.instant('APPOINTMENTS.CREATED_SUCCESS'),
      detail: this.translateService.instant('APPOINTMENTS.CREATED_DETAIL'),
      data: {
        appointmentId,
        showViewButton: true,
        actionLabel: this.translateService.instant('COMMON.ACTIONS.VIEW_DETAILS'),
      },
    });
  }

  showAppointmentDeleted(appointmentName?: string) {
    this.showToast({
      severity: 'info',
      summary: this.translateService.instant('APPOINTMENTS.DELETE_SUCCESS'),
      detail: appointmentName
        ? this.translateService.instant('APPOINTMENTS.DELETE_SUCCESS_WITH_NAME', { name: appointmentName })
        : this.translateService.instant('APPOINTMENTS.DELETE_SUCCESS'),
    });
  }

  showAppointmentUpdated(appointmentName?: string) {
    this.showToast({
      severity: 'success',
      summary: this.translateService.instant('APPOINTMENTS.UPDATE_SUCCESS'),
      detail: appointmentName
        ? this.translateService.instant('APPOINTMENTS.UPDATE_SUCCESS_WITH_NAME', { name: appointmentName })
        : this.translateService.instant('APPOINTMENTS.UPDATE_SUCCESS'),
    });
  }

  showAppointmentCreated(appointmentName?: string, appointmentId?: string) {
    this.showToast({
      severity: 'success',
      summary: this.translateService.instant('APPOINTMENTS.CREATED_SUCCESS'),
      detail: appointmentName
        ? this.translateService.instant('APPOINTMENTS.CREATED_SUCCESS_WITH_NAME', { name: appointmentName })
        : this.translateService.instant('APPOINTMENTS.CREATED_DETAIL'),
      data: {
        appointmentId,
        showViewButton: true,
        actionLabel: this.translateService.instant('COMMON.ACTIONS.VIEW_DETAILS'),
      },
    });
  }

  showValidationError(messageKey: string) {
    this.showToast({
      severity: 'error',
      summary: this.translateService.instant('COMMON.VALIDATION_ERROR'),
      detail: this.translateService.instant(messageKey),
    });
  }

  showNetworkError() {
    this.showToast({
      severity: 'error',
      summary: this.translateService.instant('COMMON.NETWORK_ERROR'),
      detail: this.translateService.instant('COMMON.NETWORK_ERROR_DETAIL'),
    });
  }

  showUnauthorizedError() {
    this.showToast({
      severity: 'error',
      summary: this.translateService.instant('COMMON.UNAUTHORIZED_ERROR'),
      detail: this.translateService.instant('COMMON.UNAUTHORIZED_ERROR_DETAIL'),
    });
  }

  showLoginRequired() {
    this.showToast({
      severity: 'warn',
      summary: this.translateService.instant('COMMON.LOGIN_REQUIRED'),
      detail: this.translateService.instant('COMMON.LOGIN_REQUIRED_DETAIL'),
    });
  }

  showGenericSuccess(messageKey: string) {
    this.showToast({
      severity: 'success',
      summary: this.translateService.instant('COMMON.SUCCESS'),
      detail: this.translateService.instant(messageKey),
    });
  }

  showGenericError(messageKey: string) {
    this.showToast({
      severity: 'error',
      summary: this.translateService.instant('COMMON.ERROR'),
      detail: this.translateService.instant(messageKey),
    });
  }

  showGenericInfo(messageKey: string) {
    this.showToast({
      severity: 'info',
      summary: this.translateService.instant('COMMON.INFO'),
      detail: this.translateService.instant(messageKey),
    });
  }

  showGenericWarning(messageKey: string) {
    this.showToast({
      severity: 'warn',
      summary: this.translateService.instant('COMMON.WARNING'),
      detail: this.translateService.instant(messageKey),
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
