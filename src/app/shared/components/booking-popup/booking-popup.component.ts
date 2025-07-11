import { Component, input, output, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { ServicesService, Service } from '../../../core/services/services.service';

export interface BookingDetails {
  date: string;
  time: string;
  clientName: string;
  service?: Service;
}



@Component({
  selector: 'pelu-booking-popup',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TranslateModule,
    ToastModule
  ],
  templateUrl: './booking-popup.component.html',
  styleUrls: ['./booking-popup.component.scss']
})
export class BookingPopupComponent {
  // Input signals
  readonly open = input<boolean>(false);
  readonly bookingDetails = input<BookingDetails>({ date: '', time: '', clientName: '' });
  readonly availableServices = input<Service[]>([]);

  // Output signals
  readonly confirmed = output<BookingDetails>();
  readonly cancelled = output<void>();





  // Computed properties
  readonly errorMessage = signal('');
  readonly canConfirm = computed(() => {
    const details = this.bookingDetails();
    return (
      details.clientName.trim() !== '' &&
      details.service !== undefined
    );
  });

  readonly totalPrice = computed(() => {
    const service = this.bookingDetails().service;
    return service ? service.price : 0;
  });

  readonly totalDuration = computed(() => {
    const service = this.bookingDetails().service;
    return service ? service.duration : 0;
  });



  private readonly translate = inject(TranslateService);

  readonly showErrorToast = signal(false);

  onClose() {
    this.cancelled.emit();
  }

  onConfirm() {
    const details = this.bookingDetails();
    const missing: string[] = [];
    if (!details.clientName.trim()) missing.push(this.translate.instant('COMMON.CLIENT_NAME'));
    if (!details.service) missing.push(this.translate.instant('COMMON.SERVICE'));
    if (missing.length > 0) {
      this.errorMessage.set(this.translate.instant('COMMON.MISSING_FIELDS') + ': ' + missing.join(', '));
      this.showErrorToast.set(true);
      setTimeout(() => this.showErrorToast.set(false), 3000);
      return;
    }
    this.confirmed.emit(details);
  }



  constructor(private servicesService: ServicesService) {
    // Constructor for dependency injection
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatPrice(price: number): string {
    return `${price}€`;
  }

  formatDuration(duration: number): string {
    return `${duration} min`;
  }



  get todayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


}
