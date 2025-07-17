import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

export interface ToastData {
  appointmentId?: string;
  showViewButton?: boolean;
  action?: () => void;
}

@Component({
  selector: 'pelu-toast',
  standalone: true,
  imports: [CommonModule, ToastModule, TranslateModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <p-toast [key]="toastKey" position="top-right" [baseZIndex]="10000" (onClick)="onToastClick($event)">
      <ng-template let-message pTemplate="message">
        <div class="toast-container">
          <!-- Icona del tipus de toast -->
          <div class="toast-icon">
            @switch (message.severity) {
              @case ('success') { ✅ }
              @case ('error') { ❌ }
              @case ('warning') { ⚠️ }
              @case ('info') { ℹ️ }
            }
          </div>

          <!-- Contingut principal -->
          <div class="toast-content">
            <div class="toast-text">
              <div class="toast-title">{{ message.summary }}</div>
              @if (message.detail) {
                <div class="toast-detail">{{ message.detail }}</div>
              }
            </div>
          </div>

          <!-- Accions -->
          <div class="toast-actions">
            @if (message.data?.showViewButton && message.data?.appointmentId) {
              <button
                type="button"
                class="toast-action-btn view-detail-btn"
                (click)="viewAppointmentDetail(message.data.appointmentId); $event.stopPropagation()">
                Veure detall
              </button>
            }
            @if (message.data?.action && !message.data?.showViewButton) {
              <button
                type="button"
                class="toast-action-btn action-btn"
                (click)="executeAction(message.data.action); $event.stopPropagation()">
                Acció
              </button>
            }

            <!-- Botó de tancar -->
            <button
              type="button"
              class="toast-close-btn"
              (click)="clearToast(); $event.stopPropagation()"
              [attr.aria-label]="'Tancar notificació'">
              ×
            </button>
          </div>
        </div>
      </ng-template>
    </p-toast>
  `,
  styles: [`
    /* Garantir que els toasts apareguin sempre per sobre de tot */
    :host {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 10000;
      pointer-events: none;
    }

    .p-toast {
      position: fixed !important;
      top: 1rem !important;
      right: 1rem !important;
      z-index: 10000 !important;
      pointer-events: auto;
    }

    /* Responsiu per mòbils */
    @media (max-width: 768px) {
      .p-toast {
        top: 0.5rem !important;
        right: 0.5rem !important;
        left: 0.5rem !important;
      }
    }
  `]
})
export class ToastComponent {
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly toastKey = 'pelu-toast';

  showToast(
    severity: 'success' | 'error' | 'info' | 'warn',
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

  clearToast() {
    this.messageService.clear(this.toastKey);
  }

  onToastClick(event: any) {
    const appointmentId = event.message?.data?.appointmentId;
    const action = event.message?.data?.action;

    if (action && typeof action === 'function') {
      this.executeAction(action);
    } else if (appointmentId) {
      this.viewAppointmentDetail(appointmentId);
    }
  }

  executeAction(action: () => void) {
    try {
      // Amagar el toast automàticament
      this.clearToast();
      action();
    } catch (error) {
      console.error('Error executing toast action:', error);
    }
  }

  viewAppointmentDetail(appointmentId: string) {
    console.log('viewAppointmentDetail called with:', appointmentId);

    // Amagar el toast automàticament
    this.clearToast();

    const user = this.authService.user();
    if (!user?.uid) {
      console.log('No user found');
      return;
    }

    const clientId = user.uid;
    const uniqueId = `${clientId}-${appointmentId}`;
    console.log('Navigating to:', uniqueId);
    this.router.navigate(['/appointments', uniqueId]);
  }
}
