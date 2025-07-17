import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

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
    this.showSuccess(`Cita eliminada`, `S'ha eliminat la cita de ${appointmentName}`);
  }

  showAppointmentUpdated(appointmentName: string) {
    this.showSuccess(`Cita actualitzada`, `S'ha actualitzat la cita de ${appointmentName}`);
  }

  showAppointmentCreated(appointmentName: string, appointmentId: string) {
    this.showSuccess(`Cita creada`, `S'ha creat la cita per ${appointmentName}`, appointmentId, true);
  }

  showValidationError(field: string) {
    this.showError('Error de validació', `El camp "${field}" és obligatori`);
  }

  showNetworkError() {
    this.showError('Error de connexió', 'No s\'ha pogut connectar amb el servidor. Si us plau, torna-ho a provar.');
  }

  showUnauthorizedError() {
    this.showError('Accés denegat', 'No tens permisos per realitzar aquesta acció.');
  }

  showLoginRequired() {
    this.showWarning('Sessió requerida', 'Si us plau, inicia sessió per continuar.');
  }

  showGenericSuccess(message: string) {
    this.showSuccess('Èxit', message);
  }

  showGenericError(message: string) {
    this.showError('Error', message);
  }

  showGenericInfo(message: string) {
    this.showInfo('Informació', message);
  }

  showGenericWarning(message: string) {
    this.showWarning('Advertència', message);
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
