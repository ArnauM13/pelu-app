import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  constructor(private router: Router) {
    // Automatically scroll to top on navigation
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.scrollToTop();
    });
  }

  /**
   * Scroll to top of the page
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  /**
   * Scroll to top immediately without animation
   */
  scrollToTopImmediate(): void {
    window.scrollTo(0, 0);
  }

  /**
   * Scroll to a specific element
   */
  scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
}
