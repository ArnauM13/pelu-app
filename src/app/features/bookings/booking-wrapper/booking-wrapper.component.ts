import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { BookingPageComponent } from '../booking-page/booking-page.component';
import { BookingMobilePageComponent } from '../booking-mobile-page/booking-mobile-page.component';

@Component({
  selector: 'pelu-booking-wrapper',
  imports: [CommonModule, BookingPageComponent, BookingMobilePageComponent],
  template: `
    @if (isMobile()) {
      <pelu-booking-mobile-page />
    } @else {
      <pelu-booking-page />
    }
  `,
})
export class BookingWrapperComponent {
  private readonly responsiveService = inject(ResponsiveService);

  readonly isMobile = computed(() => this.responsiveService.isMobile());
}
