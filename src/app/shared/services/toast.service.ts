import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastConfig, ToastData } from '../components/toast/toast.component';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warn' | 'secondary' | 'contrast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly messageService = inject(MessageService);
  private readonly defaultToastKey = 'pelu-toast';

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
        customIcon: '📅',
      },
    });
  }

  showAppointmentDeleted(appointmentName?: string) {
    this.showToast({
      severity: 'info',
      summary: 'Cita eliminada',
      detail: `La cita per a ${appointmentName || 'el client'} s'ha eliminat correctament`,
      data: {
        customIcon: '🗑️',
      },
    });
  }

  showAppointmentUpdated(appointmentName?: string) {
    this.showToast({
      severity: 'success',
      summary: 'Cita actualitzada',
      detail: `La cita per a ${appointmentName || 'el client'} s'ha actualitzat correctament`,
      data: {
        customIcon: '✏️',
      },
    });
  }

  showAppointmentCreated(appointmentName?: string, appointmentId?: string) {
    this.showToast({
      severity: 'success',
      summary: 'Cita creada',
      detail: `La cita per a ${appointmentName || 'el client'} s'ha creat correctament`,
      data: {
        appointmentId,
        showViewButton: true,
        customIcon: '✅',
      },
    });
  }

  showValidationError(message: string) {
    this.showToast({
      severity: 'error',
      summary: 'Error de validació',
      detail: message,
      data: {
        customIcon: '⚠️',
      },
    });
  }

  showNetworkError() {
    this.showToast({
      severity: 'error',
      summary: 'Error de connexió',
      detail: 'No s\'ha pogut connectar amb el servidor',
      data: {
        customIcon: '🌐',
      },
    });
  }

  showUnauthorizedError() {
    this.showToast({
      severity: 'error',
      summary: 'Accés denegat',
      detail: 'No tens permisos per realitzar aquesta acció',
      data: {
        customIcon: '🚫',
      },
    });
  }

  showLoginRequired() {
    this.showToast({
      severity: 'warn',
      summary: 'Sessió requerida',
      detail: 'Has d\'iniciar sessió per continuar',
      data: {
        customIcon: '🔐',
      },
    });
  }

  // Generic methods for backward compatibility
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

  // Advanced methods
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
    configs.forEach((config, index) => {
      setTimeout(() => {
        this.showToast(config);
      }, index * 500);
    });
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

  // Clear methods
  clearToast(key?: string) {
    this.messageService.clear(key || this.defaultToastKey);
  }

  clearAllToasts() {
    this.messageService.clear();
  }
}
