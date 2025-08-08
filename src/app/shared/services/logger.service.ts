import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

export interface LogContext {
  [key: string]: string | number | boolean | null | undefined;
}

export interface LogData {
  message: string;
  context?: LogContext;
  timestamp?: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
}

export interface ErrorDetails {
  error: Error | any;
  context: LogContext;
  userMessage?: string;
  technicalDetails?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private readonly translateService = inject(TranslateService);
  // private readonly toastService = inject(ToastService); // ELIMINAT

  private readonly isDevelopment = !environment.production;
  private readonly logHistory: LogData[] = [];
  private readonly maxHistorySize = 100;

  /**
   * Log informatiu amb context detallat
   */
  info(message: string, context?: LogContext, data?: any): void {
    const logContext = this.buildLogContext(context);
    const logMessage = this.formatLogMessage('INFO', message, logContext, data);

    if (this.isDevelopment) {
      console.log(logMessage);
    }

    // En producció, podríem enviar a un servei de logging extern
    this.sendToLoggingService('info', message, logContext, data);
  }

  /**
   * Log d'advertència amb context detallat
   */
  warn(message: string, context?: LogContext, data?: any): void {
    const logContext = this.buildLogContext(context);
    const logMessage = this.formatLogMessage('WARN', message, logContext, data);

    if (this.isDevelopment) {
      console.warn(logMessage);
    }

    this.sendToLoggingService('warn', message, logContext, data);
  }

  /**
   * Log d'error detallat amb gestió d'errors per a l'usuari
   */
  error(error: Error | any, context?: LogContext, showUserToast: boolean = true): void {
    const logContext = this.buildLogContext(context);
    const errorDetails = this.buildErrorDetails(error, logContext);

    // Log tècnic detallat
    const logMessage = this.formatErrorMessage(errorDetails);
    if (this.isDevelopment) {
      console.error(logMessage);
      console.error('Error Stack:', error?.stack);
      console.error('Error Context:', logContext);
    }

    // Enviar a servei de logging
    this.sendToLoggingService(
      'error',
      errorDetails.technicalDetails || 'Unknown error',
      logContext,
      error
    );

    // Mostrar toast a l'usuari si cal: ELIMINAT
    // if (showUserToast) {
    //   this.showUserFriendlyError(errorDetails);
    // }
  }

  /**
   * Log crític per a errors greus
   */
  critical(error: Error | any, context?: LogContext): void {
    const logContext = this.buildLogContext(context);
    const errorDetails = this.buildErrorDetails(error, logContext);
    errorDetails.severity = 'critical';

    // Log crític sempre visible
    const logMessage = this.formatErrorMessage(errorDetails);
    console.error('🚨 CRITICAL ERROR:', logMessage);
    console.error('Error Stack:', error?.stack);
    console.error('Error Context:', logContext);

    // Enviar a servei de logging amb prioritat alta
    this.sendToLoggingService(
      'critical',
      errorDetails.technicalDetails || 'Critical error',
      logContext,
      error
    );

    // Mostrar error crític a l'usuari
    // this.showUserFriendlyError(errorDetails); // ELIMINAT
  }

  /**
   * Log de debug (només en desenvolupament)
   */
  debug(message: string, context?: LogContext, data?: any): void {
    if (!this.isDevelopment) return;

    const logContext = this.buildLogContext(context);
    const logMessage = this.formatLogMessage('DEBUG', message, logContext, data);
    console.debug(logMessage);
  }

  /**
   * Log de performance
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    const logContext = this.buildLogContext(context);
    const logMessage = this.formatLogMessage('PERF', `${operation}: ${duration}ms`, logContext);

    if (this.isDevelopment) {
      console.log(`⏱️ ${logMessage}`);
    }

    this.sendToLoggingService('performance', operation, logContext, { duration });
  }

  /**
   * Log d'acció de l'usuari
   */
  userAction(action: string, context?: LogContext, data?: any): void {
    const logContext = this.buildLogContext(context);
    logContext['action'] = action;

    const logMessage = this.formatLogMessage('USER', `User action: ${action}`, logContext, data);

    if (this.isDevelopment) {
      console.log(`👤 ${logMessage}`);
    }

    this.sendToLoggingService('user_action', action, logContext, data);
  }

  /**
   * Log d'error de validació
   */
  validationError(field: string, value: any, context?: LogContext): void {
    const logContext = this.buildLogContext(context);
    const message = `Validation error for field '${field}' with value: ${JSON.stringify(value)}`;

    const logMessage = this.formatLogMessage('VALIDATION', message, logContext);

    if (this.isDevelopment) {
      console.warn(`⚠️ ${logMessage}`);
    }

    this.sendToLoggingService('validation', message, logContext, { field, value });
  }

  /**
   * Log d'error de xarxa
   */
  networkError(error: any, endpoint: string, context?: LogContext): void {
    const logContext = this.buildLogContext(context);
    logContext['data'] = JSON.stringify({ endpoint });

    const errorDetails = this.buildErrorDetails(error, logContext);
    errorDetails.userMessage = this.translateService.instant('COMMON.ERRORS.NETWORK_ERROR');
    errorDetails.technicalDetails = `Network error calling ${endpoint}: ${error?.message || 'Unknown network error'}`;

    this.error(error, logContext, true);
  }

  /**
   * Log d'error d'autenticació
   */
  authError(error: any, context?: LogContext): void {
    const logContext = this.buildLogContext(context);

    const errorDetails = this.buildErrorDetails(error, logContext);
    errorDetails.userMessage = this.translateService.instant('COMMON.ERRORS.AUTH_ERROR');
    errorDetails.technicalDetails = `Authentication error: ${error?.message || 'Unknown auth error'}`;

    this.error(error, logContext, true);
  }

  /**
   * Log d'error de Firebase
   */
  firebaseError(error: any, operation: string, context?: LogContext): void {
    const logContext = this.buildLogContext(context);
    logContext['data'] = JSON.stringify({ operation, firebaseError: true });

    const errorDetails = this.buildErrorDetails(error, logContext);
    errorDetails.userMessage = this.translateService.instant('COMMON.ERRORS.FIREBASE_ERROR');
    errorDetails.technicalDetails = `Firebase ${operation} error: ${error?.message || 'Unknown Firebase error'}`;

    this.error(error, logContext, true);
  }

  // Mètodes privats

  private buildLogContext(context?: LogContext): LogContext {
    return {
      timestamp: new Date().toISOString(),
      ...context,
    };
  }

  private buildErrorDetails(error: Error | any, context: LogContext): ErrorDetails {
    return {
      error,
      context,
      technicalDetails: error instanceof Error ? error.message : String(error),
      severity: 'medium',
    };
  }

  private formatLogMessage(
    level: string,
    message: string,
    context: LogContext,
    data?: any
  ): string {
    const timestamp = context['timestamp'] || new Date().toISOString();
    const component = context['component'] ? `[${context['component']}]` : '';
    const method = context['method'] ? `.${context['method']}` : '';
    const userId = context['userId'] ? `[User: ${context['userId']}]` : '';
    const action = context['action'] ? `[Action: ${context['action']}]` : '';

    return `${timestamp} ${level} ${component}${method} ${userId} ${action} ${message}`;
  }

  private formatErrorMessage(errorDetails: ErrorDetails): string {
    const { error, context, technicalDetails, severity } = errorDetails;
    const timestamp = context['timestamp'] || new Date().toISOString();
    const component = context['component'] ? `[${context['component']}]` : '';
    const method = context['method'] ? `.${context['method']}` : '';
    const userId = context['userId'] ? `[User: ${context['userId']}]` : '';

    return `${timestamp} ERROR ${severity.toUpperCase()} ${component}${method} ${userId} ${technicalDetails}`;
  }

  // private showUserFriendlyError(errorDetails: ErrorDetails): void {
  //   const userMessage = errorDetails.userMessage || this.translateService.instant('COMMON.ERRORS.GENERIC_ERROR');
  //   // Mostrar toast amb el missatge traduït
  //   this.toastService.showError(
  //     this.translateService.instant('COMMON.GENERAL_ERROR'),
  //     userMessage
  //   );
  // }

  private sendToLoggingService(
    level: string,
    message: string,
    context: LogContext,
    data?: any
  ): void {
    // En un entorn de producció, aquí enviaríem els logs a un servei extern
    // com ara Sentry, LogRocket, o un servei personalitzat

    const logEntry: LogData = {
      message,
      context,
      level: level as 'info' | 'warn' | 'error' | 'debug',
      timestamp: new Date().toISOString(),
    };

    this.logHistory.push(logEntry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.splice(0, this.logHistory.length - this.maxHistorySize);
    }

    if (this.isDevelopment) {
      this.saveToLocalStorage(logEntry);
    }

    // TODO: Implementar enviament a servei de logging extern
    // this.sendToExternalService(logEntry);
  }

  private saveToLocalStorage(logEntry: LogData): void {
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(logEntry);

      // Mantenir només els últims 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }

      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving log to localStorage:', error);
    }
  }

  /**
   * Obtenir logs guardats (útil per a debugging)
   */
  getStoredLogs(): LogData[] {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch (error) {
      return [];
    }
  }

  /**
   * Netejar logs guardats
   */
  clearStoredLogs(): void {
    localStorage.removeItem('app_logs');
  }
}
