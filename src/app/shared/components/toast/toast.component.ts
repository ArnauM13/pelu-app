import { Component, inject, ViewEncapsulation, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoggerService } from '../../services/logger.service';


export interface ToastData {
  appointmentId?: string;
  showViewButton?: boolean;
  action?: () => void;
  actionLabel?: string;
  customIcon?: string;
  customClass?: string;
}

export interface ToastConfig {
  severity: 'success' | 'error' | 'info' | 'warn' | 'secondary' | 'contrast';
  summary: string;
  detail?: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';
  key?: string;
  data?: ToastData;
  showTransitionOptions?: string;
  hideTransitionOptions?: string;
  showTransformOptions?: string;
  hideTransformOptions?: string;
  breakpoints?: { [key: string]: unknown };
  baseZIndex?: number;
}

@Component({
  selector: 'pelu-toast',
  standalone: true,
  imports: [CommonModule, ToastModule, TranslateModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <p-toast
      [key]="config()?.key || 'pelu-toast'"
      [position]="config()?.position || 'top-right'"
      [baseZIndex]="config()?.baseZIndex || 10000"
      [showTransitionOptions]="config()?.showTransitionOptions || '250ms ease-out'"
      [hideTransitionOptions]="config()?.hideTransitionOptions || '150ms ease-in'"
      [showTransformOptions]="config()?.showTransformOptions || 'translateX(100%)'"
      [hideTransformOptions]="config()?.hideTransformOptions || 'translateX(100%)'"
      [breakpoints]="config()?.breakpoints || { '920px': { width: '100%', right: '0', left: '0' } }"
      (onClick)="onToastClick($event)"
      (onClose)="toastClose.emit($event)"
    >
             <ng-template let-message pTemplate="message">
         <div class="toast-container" [class]="message.data?.customClass || ''">
           <!-- Main content wrapper (icon + text) -->
           <div class="toast-main-content">
             <!-- Custom Icon or Default Icon -->
             @if (message.data?.customIcon) {
               <span class="custom-icon">{{ message.data.customIcon }}</span>
             } @else {
               @switch (message.severity) {
                 @case ('success') {
                   ✅
                 }
                 @case ('error') {
                   ❌
                 }
                 @case ('warn') {
                   ⚠️
                 }
                 @case ('info') {
                   ℹ️
                 }
                 @case ('secondary') {
                   🔄
                 }
                 @case ('contrast') {
                   💡
                 }
               }
             }

             <!-- Main Content -->
             <div class="toast-content">
               <div class="toast-text">
                 <div class="toast-title">{{ message.summary }}</div>
                 @if (message.detail) {
                   <div class="toast-detail">{{ message.detail }}</div>
                 }
               </div>
             </div>
           </div>

           <!-- Actions -->
           <div class="toast-actions">
             @if (message.data?.showViewButton && message.data?.appointmentId) {
               <button
                 type="button"
                 class="toast-action-btn view-detail-btn"
                 (click)="viewAppointmentDetail(message.data!.appointmentId!); $event.stopPropagation()"
               >
                 Veure detall
               </button>
             }
             @if (message.data?.action && !message.data?.showViewButton) {
               <button
                 type="button"
                 class="toast-action-btn action-btn"
                 (click)="executeAction(message.data!.action!); $event.stopPropagation()"
               >
                 {{ message.data!.actionLabel || 'Acció' }}
               </button>
             }
           </div>
         </div>
       </ng-template>
    </p-toast>
  `,
  styles: [
    `
             /* Toast container */
       .toast-container {
         display: flex !important;
         align-items: center !important;
         width: 100% !important;
       }

       /* Main content wrapper (icon + text) */
       .toast-main-content {
         display: flex !important;
         align-items: center !important;
         gap: 12px !important;
         flex: 1 !important;
         min-width: 0 !important;
       }

      .custom-icon {
        font-size: 18px !important;
      }

             /* Toast content */
       .toast-content {
         min-width: 0 !important;
       }

      .toast-text {
        display: flex !important;
        flex-direction: column !important;
        gap: 4px !important;
      }

      .toast-title {
        font-weight: 600 !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
      }

      .toast-detail {
        font-size: 13px !important;
        line-height: 1.4 !important;
      }

      /* Toast actions */
      .toast-actions {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        flex-shrink: 0 !important;
      }

      .toast-action-btn {
        padding: 6px 12px !important;
        border: none !important;
        border-radius: 6px !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        background: var(--primary-color, #3b82f6) !important;
        color: white !important;
      }

      .toast-action-btn:hover {
        background: var(--primary-color-dark, #2563eb) !important;
        transform: translateY(-1px) !important;
      }

      .view-detail-btn {
        background: var(--success-color, #16a34a) !important;
      }

      .view-detail-btn:hover {
        background: var(--success-color-dark, #15803d) !important;
      }



      /* Responsive design */
      @media (max-width: 768px) {
        .toast-actions {
          flex-direction: column !important;
          gap: 4px !important;
        }

        .toast-action-btn {
          width: 100% !important;
          text-align: center !important;
        }
      }
    `,
  ],
})
export class ToastComponent {
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly logger = inject(LoggerService);
  // Inputs
  readonly config = input<ToastConfig>();

  // Outputs
  readonly toastClose = output<unknown>();

  showToast(config: ToastConfig) {
    const defaultConfig: Partial<ToastConfig> = {
      life: 4000,
      sticky: false,
      closable: true,
      position: 'top-right',
      key: 'pelu-toast',
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

  clearToast(key?: string) {
    this.messageService.clear(key || 'pelu-toast');
  }

  clearAllToasts() {
    this.messageService.clear();
  }

  onToastClick(event: unknown) {
    const eventData = event as { message?: { data?: { appointmentId?: string; action?: () => void } } };
    const appointmentId = eventData.message?.data?.appointmentId;
    const action = eventData.message?.data?.action;

    if (action && typeof action === 'function') {
      this.executeAction(action);
    } else if (appointmentId) {
      this.viewAppointmentDetail(appointmentId);
    }
  }

  executeAction(action: () => void) {
    try {
      this.clearToast();
      action();
    } catch (error) {
      this.logger.error(
        error,
        {
          component: 'ToastComponent',
          method: 'executeAction',
        },
        false
      );
    }
  }

  viewAppointmentDetail(appointmentId: string) {
    this.logger.userAction('viewAppointmentDetail', {
      component: 'ToastComponent',
      method: 'viewAppointmentDetail',
      userId: this.authService.user()?.uid,
      data: JSON.stringify({ appointmentId }),
    });

    this.clearToast();

    const user = this.authService.user();
    if (!user?.uid) {
      this.logger.warn('No user found when trying to view appointment detail', {
        component: 'ToastComponent',
        method: 'viewAppointmentDetail',
        data: JSON.stringify({ appointmentId }),
      });
      return;
    }

    this.logger.info('Navigating to appointment detail', {
      component: 'ToastComponent',
      method: 'viewAppointmentDetail',
      userId: user.uid,
      data: JSON.stringify({ appointmentId }),
    });

    // Navigate directly to the appointment using the appointmentId (UUID)
    this.router.navigate(['/appointments', appointmentId]);
  }
}
