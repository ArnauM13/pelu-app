import { Injectable, signal } from '@angular/core';

export interface LoaderConfig {
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly configSignal = signal<LoaderConfig>({
    message: 'COMMON.STATUS.LOADING'
  });

  // Public signals
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly config = this.configSignal.asReadonly();

  /**
   * Show loader with default configuration
   */
  show(config?: LoaderConfig): void {
    if (config) {
      this.configSignal.set({
        message: 'COMMON.STATUS.LOADING',
        ...config
      });
    }
    this.isLoadingSignal.set(true);
  }

  /**
   * Hide loader
   */
  hide(): void {
    this.isLoadingSignal.set(false);
  }

  /**
   * Show loader with custom message
   */
  showWithMessage(message: string): void {
    this.show({ message });
  }
}
