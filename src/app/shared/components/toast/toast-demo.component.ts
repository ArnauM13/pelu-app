import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';
import { ToastComponent, ToastConfig } from './toast.component';

@Component({
  selector: 'pelu-toast-demo',
  standalone: true,
  imports: [CommonModule, ButtonModule, TranslateModule, ToastComponent],
  template: `
    <div class="toast-demo">
      <!-- Toast Component -->
      <pelu-toast />
        <div class="demo-section">
          <h3>🔘 Tipus Bàsics</h3>
          <p>Toasts amb diferents severitats i estils predeterminats</p>
          <div class="button-group">
            <p-button label="Success" severity="success" (onClick)="showSuccess()" size="small">
            </p-button>
            <p-button label="Error" severity="danger" (onClick)="showError()" size="small">
            </p-button>
            <p-button label="Info" severity="info" (onClick)="showInfo()" size="small"> </p-button>
            <p-button label="Warning" severity="warn" (onClick)="showWarning()" size="small">
            </p-button>
            <p-button label="Secondary" severity="secondary" (onClick)="showSecondary()" size="small">
            </p-button>
            <p-button label="Contrast" severity="contrast" (onClick)="showContrast()" size="small">
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>🎨 Toasts amb Icones Personalitzades</h3>
          <p>Toasts amb icones personalitzades per a diferents contextos</p>
          <div class="button-group">
            <p-button
              label="🎉 Celebració"
              severity="success"
              (onClick)="showCustomIconToast()"
              size="small"
            >
            </p-button>
            <p-button
              label="📧 Email"
              severity="info"
              (onClick)="showEmailToast()"
              size="small"
            >
            </p-button>
            <p-button
              label="💾 Descarrega"
              severity="secondary"
              (onClick)="showDownloadToast()"
              size="small"
            >
            </p-button>
            <p-button
              label="🔔 Notificació"
              severity="contrast"
              (onClick)="showNotificationToast()"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>📍 Posicions</h3>
          <p>Toasts en diferents posicions de la pantalla</p>
          <div class="button-group">
            <p-button
              label="Top Left"
              severity="info"
              (onClick)="showToastAtPosition('info', 'Top Left', 'Aquest toast apareix a la part superior esquerra', 'top-left')"
              size="small"
            >
            </p-button>
            <p-button
              label="Top Center"
              severity="info"
              (onClick)="showToastAtPosition('info', 'Top Center', 'Aquest toast apareix a la part superior central', 'top-center')"
              size="small"
            >
            </p-button>
            <p-button
              label="Bottom Left"
              severity="info"
              (onClick)="showToastAtPosition('info', 'Bottom Left', 'Aquest toast apareix a la part inferior esquerra', 'bottom-left')"
              size="small"
            >
            </p-button>
            <p-button
              label="Bottom Center"
              severity="info"
              (onClick)="showToastAtPosition('info', 'Bottom Center', 'Aquest toast apareix a la part inferior central', 'bottom-center')"
              size="small"
            >
            </p-button>
            <p-button
              label="Center"
              severity="info"
              (onClick)="showToastAtPosition('info', 'Center', 'Aquest toast apareix al centre de la pantalla', 'center')"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>⏱️ Duració Personalitzada</h3>
          <p>Toasts amb diferents duracions d'exposició</p>
          <div class="button-group">
            <p-button
              label="2 segons"
              severity="success"
              (onClick)="showToastWithDuration('success', '2 segons', 'Aquest toast desapareix en 2 segons', 2000)"
              size="small"
            >
            </p-button>
            <p-button
              label="8 segons"
              severity="warn"
              (onClick)="showToastWithDuration('warn', '8 segons', 'Aquest toast desapareix en 8 segons', 8000)"
              size="small"
            >
            </p-button>
            <p-button
              label="Sticky"
              severity="info"
              (onClick)="showStickyToast()"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>🎭 Casos d'Ús Específics</h3>
          <p>Toasts per a casos d'ús comuns de l'aplicació</p>
          <div class="button-group">
            <p-button
              label="Reserva Creada"
              severity="success"
              (onClick)="showReservationCreated()"
              size="small"
            >
            </p-button>
            <p-button
              label="Cita Eliminada"
              severity="success"
              (onClick)="showAppointmentDeleted()"
              size="small"
            >
            </p-button>
            <p-button
              label="Error Validació"
              severity="danger"
              (onClick)="showValidationError()"
              size="small"
            >
            </p-button>
            <p-button
              label="Error Xarxa"
              severity="danger"
              (onClick)="showNetworkError()"
              size="small"
            >
            </p-button>
            <p-button
              label="Login Requerit"
              severity="warn"
              (onClick)="showLoginRequired()"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>🎯 Toasts amb Accions</h3>
          <p>Toasts que inclouen botons d'acció personalitzats</p>
          <div class="button-group">
            <p-button
              label="Amb Acció"
              severity="info"
              (onClick)="showToastWithAction()"
              size="small"
            >
            </p-button>
            <p-button
              label="Amb Múltiples Accions"
              severity="success"
              (onClick)="showToastWithMultipleActions()"
              size="small"
            >
            </p-button>
            <p-button
              label="Sense Tancar"
              severity="warn"
              (onClick)="showToastWithoutClose()"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>🎪 Toasts Múltiples</h3>
          <p>Mostrar múltiples toasts simultàniament</p>
          <div class="button-group">
            <p-button
              label="Múltiples Toasts"
              severity="secondary"
              (onClick)="showMultipleToasts()"
              size="small"
            >
            </p-button>
            <p-button
              label="Cascada"
              severity="contrast"
              (onClick)="showCascadeToasts()"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>🎨 Toasts Amb Classes Personalitzades</h3>
          <p>Toasts amb estils CSS personalitzats</p>
          <div class="button-group">
            <p-button
              label="Premium"
              severity="success"
              (onClick)="showPremiumToast()"
              size="small"
            >
            </p-button>
            <p-button
              label="Urgent"
              severity="danger"
              (onClick)="showUrgentToast()"
              size="small"
            >
            </p-button>
            <p-button
              label="Festiu"
              severity="info"
              (onClick)="showFestiveToast()"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>🧹 Gestió de Toasts</h3>
          <p>Mètodes per gestionar els toasts existents</p>
          <div class="button-group">
            <p-button
              label="Netejar Toasts"
              severity="secondary"
              (onClick)="clearAllToasts()"
              size="small"
            >
            </p-button>
            <p-button
              label="Netejar Específic"
              severity="secondary"
              (onClick)="clearSpecificToast()"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>🔧 Configuració Avançada</h3>
          <p>Toasts amb configuració completa personalitzada</p>
          <div class="button-group">
            <p-button
              label="Configuració Completa"
              severity="primary"
              (onClick)="showAdvancedConfigToast()"
              size="small"
            >
            </p-button>
            <p-button
              label="Amb Breakpoints"
              severity="info"
              (onClick)="showToastWithBreakpoints()"
              size="small"
            >
            </p-button>
            <p-button
              label="Amb Animacions"
              severity="success"
              (onClick)="showToastWithAnimations()"
              size="small"
            >
            </p-button>
          </div>
        </div>
    </div>
  `,
  styles: [
    `
      .toast-demo {
        padding: 1rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .demo-section {
        margin-bottom: 2.5rem;
        padding: 1.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        background: #fafafa;
      }

      .demo-section h3 {
        margin-bottom: 0.5rem;
        color: #1f2937;
        font-size: 1.2rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .demo-section p {
        margin-bottom: 1rem;
        color: #6b7280;
        font-size: 0.9rem;
        line-height: 1.5;
      }

      .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .button-group p-button {
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
      }

      /* Custom toast styles for demo */
      .premium-toast {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        border: 2px solid #fbbf24 !important;
      }

      .urgent-toast {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
        color: white !important;
        animation: pulse 2s infinite !important;
      }

      .festive-toast {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        color: white !important;
        border: 2px dashed #fbbf24 !important;
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.8;
        }
      }

      @media (max-width: 768px) {
        .toast-demo {
          padding: 0.5rem;
        }

        .demo-section {
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .button-group {
          flex-direction: column;
        }

        .button-group p-button {
          width: 100%;
          margin-right: 0;
        }
      }
    `,
  ],
})
export class ToastDemoComponent {
  private readonly toastService = inject(ToastService);

  // Basic types
  showSuccess() {
    this.toastService.showSuccess('Operació completada amb èxit', 'La teva acció s\'ha realitzat correctament');
  }

  showError() {
    this.toastService.showError('Ha ocorregut un error inesperat', 'Si us plau, torna-ho a provar més tard');
  }

  showInfo() {
    this.toastService.showInfo('Informació important', 'Aquest és un missatge informatiu per l\'usuari');
  }

  showWarning() {
    this.toastService.showWarning('Advertència', 'Aquesta acció pot tenir conseqüències');
  }

  showSecondary() {
    this.toastService.showSecondary('Missatge secundari', 'Aquest és un missatge de tipus secundari');
  }

  showContrast() {
    this.toastService.showContrast('Missatge de contrast', 'Aquest missatge destaca del fons');
  }

  // Custom icons
  showCustomIconToast() {
    this.toastService.showToastWithCustomIcon(
      {
        severity: 'success',
        summary: 'Celebració!',
        detail: 'Has completat una tasca important',
      },
      '🎉'
    );
  }

  showEmailToast() {
    this.toastService.showToastWithCustomIcon(
      {
        severity: 'info',
        summary: 'Email enviat',
        detail: 'El teu missatge s\'ha enviat correctament',
      },
      '📧'
    );
  }

  showDownloadToast() {
    this.toastService.showToastWithCustomIcon(
      {
        severity: 'secondary',
        summary: 'Descarrega completada',
        detail: 'El fitxer s\'ha descarregat correctament',
      },
      '💾'
    );
  }

  showNotificationToast() {
    this.toastService.showToastWithCustomIcon(
      {
        severity: 'contrast',
        summary: 'Nova notificació',
        detail: 'Tens un missatge nou',
      },
      '🔔'
    );
  }

  // Positions
  showToastAtPosition(severity: 'success' | 'error' | 'info' | 'warn' | 'secondary' | 'contrast', summary: string, detail: string, position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center') {
    this.toastService.showToastAtPosition({
      severity,
      summary,
      detail,
    }, position);
  }

  // Duration
  showToastWithDuration(severity: 'success' | 'error' | 'info' | 'warn' | 'secondary' | 'contrast', summary: string, detail: string, life: number) {
    this.toastService.showToastWithDuration({
      severity,
      summary,
      detail,
    }, life);
  }

  showStickyToast() {
    this.toastService.showStickyToast({
      severity: 'info',
      summary: 'Toast Sticky',
      detail: 'Aquest toast no desapareix automàticament. Has de tancar-lo manualment.',
    });
  }

  // Specific use cases
  showReservationCreated() {
    this.toastService.showReservationCreated('demo-appointment-123');
  }

  showAppointmentDeleted() {
    this.toastService.showAppointmentDeleted('Joan Pérez');
  }

  showValidationError() {
    this.toastService.showValidationError('nom del client');
  }

  showNetworkError() {
    this.toastService.showNetworkError();
  }

  showLoginRequired() {
    this.toastService.showLoginRequired();
  }

  // Actions
  showToastWithAction() {
    this.toastService.showToastWithAction(
      {
        severity: 'info',
        summary: 'Acció disponible',
        detail: 'Clica el botó per executar una acció personalitzada',
      },
      () => {
        alert('Acció personalitzada executada!');
      },
      'Executar Acció'
    );
  }

  showToastWithMultipleActions() {
    this.toastService.showToast({
      severity: 'success',
      summary: 'Múltiples accions',
      detail: 'Aquest toast té múltiples opcions disponibles',
      data: {
        customIcon: '⚙️',
        action: () => {
          alert('Acció principal executada!');
        },
        actionLabel: 'Acció Principal',
      },
    });
  }

  showToastWithoutClose() {
    this.toastService.showToast({
      severity: 'warn',
      summary: 'Toast sense tancar',
      detail: 'Aquest toast no es pot tancar manualment',
      closable: false,
      data: {
        customIcon: '🔒',
      },
    });
  }

  // Multiple toasts
  showMultipleToasts() {
    const configs: ToastConfig[] = [
      {
        severity: 'success',
        summary: 'Primer toast',
        detail: 'Aquest és el primer toast',
        data: { customIcon: '1️⃣' },
      },
      {
        severity: 'info',
        summary: 'Segon toast',
        detail: 'Aquest és el segon toast',
        data: { customIcon: '2️⃣' },
      },
      {
        severity: 'warn',
        summary: 'Tercer toast',
        detail: 'Aquest és el tercer toast',
        data: { customIcon: '3️⃣' },
      },
    ];

    this.toastService.showMultipleToasts(configs);
  }

  showCascadeToasts() {
    setTimeout(() => this.toastService.showSuccess('Primer', 'Cascada 1'), 0);
    setTimeout(() => this.toastService.showInfo('Segon', 'Cascada 2'), 1000);
    setTimeout(() => this.toastService.showWarning('Tercer', 'Cascada 3'), 2000);
    setTimeout(() => this.toastService.showError('Quart', 'Cascada 4'), 3000);
  }

  // Custom classes
  showPremiumToast() {
    this.toastService.showToastWithCustomClass(
      {
        severity: 'success',
        summary: 'Versió Premium',
        detail: 'Has activat les funcions premium',
        data: { customIcon: '👑' },
      },
      'premium-toast'
    );
  }

  showUrgentToast() {
    this.toastService.showToastWithCustomClass(
      {
        severity: 'error',
        summary: 'URGENT',
        detail: 'Aquesta és una notificació urgent',
        data: { customIcon: '🚨' },
      },
      'urgent-toast'
    );
  }

  showFestiveToast() {
    this.toastService.showToastWithCustomClass(
      {
        severity: 'info',
        summary: 'Festiu!',
        detail: 'Celebració especial',
        data: { customIcon: '🎊' },
      },
      'festive-toast'
    );
  }

  // Management
  clearAllToasts() {
    this.toastService.clearAllToasts();
  }

  clearSpecificToast() {
    this.toastService.clearToast();
  }

  // Advanced configuration
  showAdvancedConfigToast() {
    this.toastService.showToast({
      severity: 'info',
      summary: 'Configuració Avançada',
      detail: 'Aquest toast té una configuració completa personalitzada',
      life: 6000,
      position: 'center',
      data: {
        customIcon: '⚙️',
        customClass: 'premium-toast',
      },
      showTransitionOptions: '500ms ease-out',
      hideTransitionOptions: '300ms ease-in',
      showTransformOptions: 'translateY(-50px)',
      hideTransformOptions: 'translateY(50px)',
    });
  }

  showToastWithBreakpoints() {
    this.toastService.showToast({
      severity: 'info',
      summary: 'Responsiu',
      detail: 'Aquest toast s\'adapta a diferents mides de pantalla',
      data: { customIcon: '📱' },
      breakpoints: {
        '920px': { width: '100%', right: '0', left: '0' },
        '768px': { width: '95%', right: '2.5%', left: '2.5%' },
      },
    });
  }

  showToastWithAnimations() {
    this.toastService.showToast({
      severity: 'success',
      summary: 'Amb Animacions',
      detail: 'Aquest toast té animacions personalitzades',
      data: { customIcon: '🎬' },
      showTransitionOptions: '800ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      hideTransitionOptions: '400ms cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      showTransformOptions: 'scale(0.3) rotate(180deg)',
      hideTransformOptions: 'scale(0.3) rotate(-180deg)',
    });
  }
}
