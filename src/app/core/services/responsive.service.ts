import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  private readonly platformId = inject(PLATFORM_ID);

  // Breakpoint per mobile (768px és el breakpoint estàndard)
  private readonly MOBILE_BREAKPOINT = 768;

  // Signal per l'amplada de la pantalla
  private readonly screenWidthSignal = signal<number>(0);

  // Computed signals
  readonly isMobile = computed(() => this.screenWidthSignal() <= this.MOBILE_BREAKPOINT);
  readonly isDesktop = computed(() => this.screenWidthSignal() > this.MOBILE_BREAKPOINT);
  readonly screenWidth = computed(() => this.screenWidthSignal());

  constructor() {
    this.initializeScreenWidth();
    this.setupResizeListener();
  }

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

  // Mètode per obtenir el breakpoint actual
  getBreakpoint(): 'mobile' | 'desktop' {
    return this.isMobile() ? 'mobile' : 'desktop';
  }

  // Mètode per verificar si estem en un rang específic
  isInRange(min: number, max: number): boolean {
    const width = this.screenWidth();
    return width >= min && width <= max;
  }
}
