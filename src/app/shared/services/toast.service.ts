import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LoggerService } from './logger.service';

export interface ToastData {
  appointmentId?: string;
  showViewButton?: boolean;
  action?: () => void;
}

export type ToastSeverity = 'success' | 'error' | 'info' | 'warn';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly logger = inject(LoggerService);

  private readonly toastKey = 'pelu-toast';

  // Mètode principal per mostrar toasts
  showToast(
    severity: ToastSeverity,
    summary: string,
    detail: string = '',
    appointmentId?: string,
    showViewButton: boolean = false,
    action?: () => void
  ) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 4000,
      closable: false,
      key: this.toastKey,
      data: { appointmentId, showViewButton, action } as ToastData
    });
  }

  // Mètodes ràpids per diferents tipus de toast
  showSuccess(summary: string, detail: string = '', appointmentId?: string, showViewButton: boolean = false) {
    this.showToast('success', summary, detail, appointmentId, showViewButton);
  }

  showError(summary: string, detail: string = '') {
    this.showToast('error', summary, detail);
  }

  showInfo(summary: string, detail: string = '') {
    this.showToast('info', summary, detail);
  }

  showWarning(summary: string, detail: string = '') {
    this.showToast('warn', summary, detail);
  }

  // Mètodes específics per casos d'ús comuns
  showReservationCreated(appointmentId: string) {
    this.showSuccess('COMMON.RESERVATION_CREATED', '', appointmentId, true);
  }

  showAppointmentDeleted(appointmentName: string) {
    this.showSuccess('COMMON.TOAST.APPOINTMENT_DELETED', `COMMON.TOAST.APPOINTMENT_DELETED_MESSAGE`, undefined, false);
  }

  showAppointmentUpdated(appointmentName: string) {
    this.showSuccess('COMMON.TOAST.APPOINTMENT_UPDATED', `COMMON.TOAST.APPOINTMENT_UPDATED_MESSAGE`, undefined, false);
  }

  showAppointmentCreated(appointmentName: string, appointmentId: string) {
    this.showSuccess('COMMON.TOAST.APPOINTMENT_CREATED', `COMMON.TOAST.APPOINTMENT_CREATED_MESSAGE`, appointmentId, true);
  }

  showValidationError(field: string) {
    this.showError('COMMON.ERRORS.VALIDATION_ERROR', `COMMON.TOAST.VALIDATION_ERROR_MESSAGE`);
  }

  showNetworkError() {
    this.showError('COMMON.ERRORS.NETWORK_ERROR', 'COMMON.TOAST.NETWORK_ERROR_MESSAGE');
  }

  showUnauthorizedError() {
    this.showError('COMMON.ERRORS.PERMISSION_ERROR', 'No tens permisos per realitzar aquesta acció.');
  }

  showLoginRequired() {
    this.showWarning('AUTH.SESSION_REQUIRED', 'COMMON.TOAST.LOGIN_REQUIRED_MESSAGE');
  }

  showGenericSuccess(message: string) {
    this.showSuccess('COMMON.STATUS.STATUS_SUCCESS', message);
  }

  showGenericError(message: string) {
    this.showError('COMMON.GENERAL_ERROR', message);
  }

  showGenericInfo(message: string) {
    this.showInfo('COMMON.STATUS.STATUS_INFO', message);
  }

  showGenericWarning(message: string) {
    this.showWarning('COMMON.STATUS.STATUS_WARNING', message);
  }

  // Mètodes per gestionar toasts
  clearToast() {
    this.messageService.clear(this.toastKey);
  }

  clearAllToasts() {
    this.messageService.clear();
  }

  // Mètodes per navegació des de toasts
  onToastClick(event: any) {
    const appointmentId = event.message?.data?.appointmentId;
    const action = event.message?.data?.action;

    if (action && typeof action === 'function') {
      action();
    } else if (appointmentId) {
      this.viewAppointmentDetail(appointmentId);
    }
  }

  viewAppointmentDetail(appointmentId: string) {
    const user = this.authService.user();
    if (!user?.uid) {
      return;
    }

    const clientId = user.uid;
    const uniqueId = `${clientId}-${appointmentId}`;
    this.router.navigate(['/appointments', uniqueId]);
  }

  // Mètode per mostrar toasts amb accions personalitzades
  showToastWithAction(
    severity: ToastSeverity,
    summary: string,
    detail: string,
    action: () => void,
    actionLabel: string = 'Acció'
  ) {
    this.showToast(severity, summary, detail, undefined, false, action);
  }
}
