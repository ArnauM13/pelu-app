import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TranslateModule } from '@ngx-translate/core';
import { LoggerService } from '../../services/logger.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'pelu-logger-demo',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TranslateModule],
  template: `
    <div class="logger-demo">
      <p-card header="Demo del Sistema de Logging Millorat" styleClass="w-full">
        <div class="demo-section">
          <h3>Logs Bàsics</h3>
          <div class="button-group">
            <p-button label="Info Log" severity="info" (onClick)="showInfoLog()" size="small">
            </p-button>
            <p-button label="Warning Log" severity="warn" (onClick)="showWarningLog()" size="small">
            </p-button>
            <p-button
              label="Debug Log"
              severity="secondary"
              (onClick)="showDebugLog()"
              size="small"
            >
            </p-button>
            <p-button
              label="Performance Log"
              severity="success"
              (onClick)="showPerformanceLog()"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>Errors Detallats</h3>
          <div class="button-group">
            <p-button
              label="Error Normal"
              severity="danger"
              (onClick)="showNormalError()"
              size="small"
            >
            </p-button>
            <p-button
              label="Error Crític"
              severity="danger"
              (onClick)="showCriticalError()"
              size="small"
            >
            </p-button>
            <p-button
              label="Error Firebase"
              severity="danger"
              (onClick)="showFirebaseError()"
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
          </div>
        </div>

        <div class="demo-section">
          <h3>Errors Específics</h3>
          <div class="button-group">
            <p-button
              label="Error Validació"
              severity="danger"
              (onClick)="showValidationError()"
              size="small"
            >
            </p-button>
            <p-button label="Error Auth" severity="danger" (onClick)="showAuthError()" size="small">
            </p-button>
            <p-button
              label="Error Permisos"
              severity="danger"
              (onClick)="showPermissionError()"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>Accions d'Usuari</h3>
          <div class="button-group">
            <p-button
              label="Acció Usuari"
              severity="info"
              (onClick)="showUserAction()"
              size="small"
            >
            </p-button>
            <p-button
              label="Acció amb Dades"
              severity="info"
              (onClick)="showUserActionWithData()"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>Gestor de Logs</h3>
          <div class="button-group">
            <p-button label="Veure Logs" severity="info" (onClick)="viewStoredLogs()" size="small">
            </p-button>
            <p-button
              label="Netejar Logs"
              severity="warn"
              (onClick)="clearStoredLogs()"
              size="small"
            >
            </p-button>
            <p-button
              label="Exportar Logs"
              severity="success"
              (onClick)="exportLogs()"
              size="small"
            >
            </p-button>
          </div>
        </div>

        <div class="demo-section" *ngIf="storedLogs.length > 0">
          <h3>Logs Guardats ({{ storedLogs.length }})</h3>
          <div class="logs-container">
            <div
              *ngFor="let log of storedLogs.slice(-5); trackBy: trackByLog"
              class="log-entry"
              [class]="'log-' + log.level"
            >
              <div class="log-header">
                <span class="log-level">{{ log.level.toUpperCase() }}</span>
                <span class="log-timestamp">{{ log.timestamp | date: 'short' }}</span>
              </div>
              <div class="log-message">{{ log.message }}</div>
              <div class="log-context" *ngIf="log.context?.component">
                {{ log.context.component }}.{{ log.context.method }}
              </div>
            </div>
          </div>
        </div>
      </p-card>
    </div>
  `,
  styles: [
    `
      .logger-demo {
        padding: 1rem;
        max-width: 1000px;
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

      .logs-container {
        max-height: 400px;
        overflow-y: auto;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1rem;
        background: #f9fafb;
      }

      .log-entry {
        margin-bottom: 1rem;
        padding: 0.75rem;
        border-radius: 6px;
        border-left: 4px solid;
        background: white;
      }

      .log-info {
        border-left-color: #3b82f6;
      }

      .log-warn {
        border-left-color: #f59e0b;
      }

      .log-error {
        border-left-color: #ef4444;
      }

      .log-critical {
        border-left-color: #dc2626;
        background: #fef2f2;
      }

      .log-debug {
        border-left-color: #6b7280;
      }

      .log-performance {
        border-left-color: #10b981;
      }

      .log-user_action {
        border-left-color: #8b5cf6;
      }

      .log-validation {
        border-left-color: #f97316;
      }

      .log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .log-level {
        font-weight: 600;
        font-size: 0.875rem;
      }

      .log-timestamp {
        font-size: 0.75rem;
        color: #6b7280;
      }

      .log-message {
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
      }

      .log-context {
        font-size: 0.75rem;
        color: #6b7280;
        font-family: monospace;
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
export class LoggerDemoComponent {
  private readonly logger = inject(LoggerService);
  private readonly toastService = inject(ToastService);

  storedLogs: any[] = [];

  constructor() {
    this.loadStoredLogs();
  }

  // Logs bàsics
  showInfoLog() {
    this.logger.info('Això és un log informatiu de prova', {
      component: 'LoggerDemoComponent',
      method: 'showInfoLog',
      userId: 'demo-user-123',
    });
    this.toastService.showInfo('LOGGER_DEMO.LOG_INFO', 'LOGGER_DEMO.INFO_LOG_GENERATED');
    this.loadStoredLogs();
  }

  showWarningLog() {
    this.logger.warn("Això és un log d'advertència de prova", {
      component: 'LoggerDemoComponent',
      method: 'showWarningLog',
      userId: 'demo-user-123',
    });
    this.toastService.showWarning('LOGGER_DEMO.LOG_WARNING', 'LOGGER_DEMO.WARNING_LOG_GENERATED');
    this.loadStoredLogs();
  }

  showDebugLog() {
    this.logger.debug('Això és un log de debug de prova', {
      component: 'LoggerDemoComponent',
      method: 'showDebugLog',
      userId: 'demo-user-123',
    });
    this.toastService.showInfo(
      'LOGGER_DEMO.LOG_DEBUG',
      'LOGGER_DEMO.DEBUG_LOG_GENERATED'
    );
    this.loadStoredLogs();
  }

  showPerformanceLog() {
    const startTime = performance.now();

    // Simular una operació
    setTimeout(() => {
      const duration = performance.now() - startTime;
      this.logger.performance('Operació de prova', duration, {
        component: 'LoggerDemoComponent',
        method: 'showPerformanceLog',
        userId: 'demo-user-123',
      });
      this.toastService.showSuccess(
        'LOGGER_DEMO.LOG_PERFORMANCE',
        `LOGGER_DEMO.PERFORMANCE_OPERATION_COMPLETED`
      );
      this.loadStoredLogs();
    }, 100);
  }

  // Errors detallats
  showNormalError() {
    const error = new Error('Això és un error de prova');
    this.logger.error(error, {
      component: 'LoggerDemoComponent',
      method: 'showNormalError',
      userId: 'demo-user-123',
    });
    this.loadStoredLogs();
  }

  showCriticalError() {
    const error = new Error('Això és un error crític de prova');
    this.logger.critical(error, {
      component: 'LoggerDemoComponent',
      method: 'showCriticalError',
      userId: 'demo-user-123',
    });
    this.loadStoredLogs();
  }

  showFirebaseError() {
    const error = new Error('Error de Firebase de prova');
    this.logger.firebaseError(error, 'testOperation', {
      component: 'LoggerDemoComponent',
      method: 'showFirebaseError',
      userId: 'demo-user-123',
    });
    this.loadStoredLogs();
  }

  showNetworkError() {
    const error = new Error('Error de xarxa de prova');
    this.logger.networkError(error, '/api/test', {
      component: 'LoggerDemoComponent',
      method: 'showNetworkError',
      userId: 'demo-user-123',
    });
    this.loadStoredLogs();
  }

  // Errors específics
  showValidationError() {
    this.logger.validationError('email', 'invalid-email', {
      component: 'LoggerDemoComponent',
      method: 'showValidationError',
      userId: 'demo-user-123',
    });
    this.toastService.showError(
      'COMMON.ERROR',
      'LOGGER_DEMO.VALIDATION_ERROR_GENERATED'
    );
    this.loadStoredLogs();
  }

  showAuthError() {
    const error = new Error("Error d'autenticació de prova");
    this.logger.authError(error, {
      component: 'LoggerDemoComponent',
      method: 'showAuthError',
      userId: 'demo-user-123',
    });
    this.loadStoredLogs();
  }

  showPermissionError() {
    const error = new Error('Error de permisos de prova');
    this.logger.error(error, {
      component: 'LoggerDemoComponent',
      method: 'showPermissionError',
      userId: 'demo-user-123',
    });
    this.toastService.showError(
      'COMMON.ERROR',
      'LOGGER_DEMO.PERMISSION_ERROR_GENERATED'
    );
    this.loadStoredLogs();
  }

  // Accions d'usuari
  showUserAction() {
    this.logger.userAction('button_click', {
      component: 'LoggerDemoComponent',
      method: 'showUserAction',
      userId: 'demo-user-123',
    });
    this.toastService.showInfo('LOGGER_DEMO.USER_ACTION', 'LOGGER_DEMO.USER_ACTION_REGISTERED');
    this.loadStoredLogs();
  }

  showUserActionWithData() {
    this.logger.userAction(
      'form_submit',
      {
        component: 'LoggerDemoComponent',
        method: 'showUserActionWithData',
        userId: 'demo-user-123',
      },
      { formData: { name: 'Test User', action: 'submit' } }
    );
    this.toastService.showInfo('LOGGER_DEMO.ACTION_WITH_DATA', 'LOGGER_DEMO.USER_ACTION_WITH_DATA_REGISTERED');
    this.loadStoredLogs();
  }

  // Gestor de logs
  viewStoredLogs() {
    this.loadStoredLogs();
    this.toastService.showInfo('LOGGER_DEMO.LOGS_LOADED', `LOGGER_DEMO.LOGS_LOADED_COUNT`);
  }

  clearStoredLogs() {
    this.logger.clearStoredLogs();
    this.storedLogs = [];
    this.toastService.showSuccess('LOGGER_DEMO.LOGS_CLEARED', 'LOGGER_DEMO.LOGS_CLEARED_SUCCESS');
  }

  exportLogs() {
    const logs = this.logger.getStoredLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `app-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    this.toastService.showSuccess('LOGGER_DEMO.LOGS_EXPORTED', 'LOGGER_DEMO.LOGS_EXPORTED_SUCCESS');
  }

  private loadStoredLogs() {
    this.storedLogs = this.logger.getStoredLogs();
  }

  trackByLog(index: number, log: any): string {
    return log.timestamp + log.level + log.message;
  }
}
