import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';

export interface LoaderConfig {
  message?: string;
  showSpinner?: boolean;
  overlay?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UIService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  // Responsive state
  private readonly MOBILE_BREAKPOINT = 768;
  private readonly screenWidthSignal = signal<number>(0);

  // Loader state
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly configSignal = signal<LoaderConfig>({
    message: 'COMMON.STATUS.LOADING',
    showSpinner: true,
    overlay: true,
  });

  // Public computed signals for responsive
  readonly isMobile = computed(() => this.screenWidthSignal() <= this.MOBILE_BREAKPOINT);
  readonly isDesktop = computed(() => this.screenWidthSignal() > this.MOBILE_BREAKPOINT);
  readonly screenWidth = computed(() => this.screenWidthSignal());

  // Public computed signals for loader
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly config = this.configSignal.asReadonly();

  constructor() {
    this.initializeScreenWidth();
    this.setupResizeListener();
    this.setupScrollToTop();
  }

  // ===== RESPONSIVE METHODS =====

  private initializeScreenWidth(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidthSignal.set(window.innerWidth);
    }
  }

  private setupResizeListener(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', () => {
        this.screenWidthSignal.set(window.innerWidth);
      });
    }
  }

  getBreakpoint(): 'mobile' | 'desktop' {
    return this.isMobile() ? 'mobile' : 'desktop';
  }

  isInRange(min: number, max: number): boolean {
    const width = this.screenWidth();
    return width >= min && width <= max;
  }

  // ===== SCROLL METHODS =====

  private setupScrollToTop(): void {
    // Automatically scroll to top on navigation
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.scrollToTop();
    });
  }

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }
  }

  scrollToTopImmediate(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
  }

  scrollToElement(elementId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  }

  // ===== LOADER METHODS =====

  show(config?: LoaderConfig): void {
    if (config) {
      this.configSignal.set({
        message: 'COMMON.STATUS.LOADING',
        showSpinner: true,
        overlay: true,
        ...config,
      });
    }
    this.isLoadingSignal.set(true);
  }

  hide(): void {
    this.isLoadingSignal.set(false);
  }

  showWithMessage(message: string): void {
    this.show({ message });
  }

  showInline(config?: LoaderConfig): void {
    this.show({ ...config, overlay: false });
  }

  showMessageOnly(message: string): void {
    this.show({ message, showSpinner: false });
  }
}
