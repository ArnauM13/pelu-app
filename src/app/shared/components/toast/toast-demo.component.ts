import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'pelu-toast-demo',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TranslateModule],
  template: `
    <div class="toast-demo">
      <p-card header="Demo del sistema de Toasts" styleClass="w-full">
        <div class="demo-section">
          <h3>Mètodes bàsics</h3>
          <div class="button-group">
            <p-button label="Success" severity="success" (onClick)="showSuccess()" size="small">
            </p-button>
            <p-button label="Error" severity="danger" (onClick)="showError()" size="small">
            </p-button>
            <p-button label="Info" severity="info" (onClick)="showInfo()" size="small"> </p-button>
            <p-button label="Warning" severity="warn" (onClick)="showWarning()" size="small">
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>Mètodes específics</h3>
          <div class="button-group">
            <p-button
              label="Reserva creada"
              severity="success"
              (onClick)="showReservationCreated()"
              size="small"
            >
            </p-button>
            <p-button
              label="Cita eliminada"
              severity="success"
              (onClick)="showAppointmentDeleted()"
              size="small"
            >
            </p-button>
            <p-button
              label="Cita actualitzada"
              severity="success"
              (onClick)="showAppointmentUpdated()"
              size="small"
            >
            </p-button>
            <p-button
              label="Error validació"
              severity="danger"
              (onClick)="showValidationError()"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>Mètodes genèrics</h3>
          <div class="button-group">
            <p-button
              label="Èxit genèric"
              severity="success"
              (onClick)="showGenericSuccess()"
              size="small"
            >
            </p-button>
            <p-button
              label="Error genèric"
              severity="danger"
              (onClick)="showGenericError()"
              size="small"
            >
            </p-button>
            <p-button
              label="Info genèric"
              severity="info"
              (onClick)="showGenericInfo()"
              size="small"
            >
            </p-button>
            <p-button
              label="Warning genèric"
              severity="warn"
              (onClick)="showGenericWarning()"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>Errors específics</h3>
          <div class="button-group">
            <p-button
              label="Error xarxa"
              severity="danger"
              (onClick)="showNetworkError()"
              size="small"
            >
            </p-button>
            <p-button
              label="No autoritzat"
              severity="danger"
              (onClick)="showUnauthorizedError()"
              size="small"
            >
            </p-button>
            <p-button
              label="Sessió requerida"
              severity="warn"
              (onClick)="showLoginRequired()"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>Accions</h3>
          <div class="button-group">
            <p-button
              label="Toast amb acció"
              severity="info"
              (onClick)="showToastWithAction()"
              size="small"
            >
            </p-button>
            <p-button
              label="Netejar toasts"
              severity="secondary"
              (onClick)="clearToasts()"
              size="small"
            >
            </p-button>
          </div>
        </div>
      </p-card>
    </div>
  `,
  styles: [
    `
      .toast-demo {
        padding: 1rem;
        max-width: 800px;
        margin: 0 auto;
      }

      .demo-section {
        margin-bottom: 2rem;
      }

      .demo-section h3 {
        margin-bottom: 1rem;
        color: #374151;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .button-group p-button {
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
      }

      @media (max-width: 768px) {
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

  // Mètodes bàsics
  showSuccess() {
    this.toastService.showSuccess('Operació completada amb èxit');
  }

  showError() {
    this.toastService.showError('Ha ocorregut un error inesperat');
  }

  showInfo() {
    this.toastService.showInfo("Informació important per l'usuari");
  }

  showWarning() {
    this.toastService.showWarning('Advertència: Acció important');
  }

  // Mètodes específics
  showReservationCreated() {
    this.toastService.showReservationCreated('demo-appointment-123');
  }

  showAppointmentDeleted() {
    this.toastService.showAppointmentDeleted('Joan Pérez');
  }

  showAppointmentUpdated() {
    this.toastService.showAppointmentUpdated('Maria García');
  }

  showValidationError() {
    this.toastService.showValidationError('nom del client');
  }

  // Mètodes genèrics
  showGenericSuccess() {
    this.toastService.showGenericSuccess('Operació completada amb èxit');
  }

  showGenericError() {
    this.toastService.showGenericError('Ha ocorregut un error inesperat');
  }

  showGenericInfo() {
    this.toastService.showGenericInfo("Informació important per l'usuari");
  }

  showGenericWarning() {
    this.toastService.showGenericWarning('Advertència: Acció important');
  }

  // Errors específics
  showNetworkError() {
    this.toastService.showNetworkError();
  }

  showUnauthorizedError() {
    this.toastService.showUnauthorizedError();
  }

  showLoginRequired() {
    this.toastService.showLoginRequired();
  }

  // Accions
  showToastWithAction() {
    this.toastService.showToastWithAction(
      'success',
      'Acció completada',
      "La teva acció s'ha realitzat correctament. Clica per veure més detalls.",
      () => {
        console.log('Acció personalitzada executada!');
        alert('Acció personalitzada executada!');
      },
      'Veure detalls'
    );
  }

  clearToasts() {
    this.toastService.clearAllToasts();
  }
}
