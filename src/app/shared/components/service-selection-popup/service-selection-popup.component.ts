import { Component, EventEmitter, Input, Output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PopularBadgeComponent } from '../popular-badge/popular-badge.component';
import { PopupDialogComponent, PopupDialogConfig } from '../popup-dialog/popup-dialog.component';
import { ToastService } from '../../services/toast.service';
import { ServiceTranslationService } from '../../../core/services/service-translation.service';
import {
  FirebaseService,
  FirebaseServicesService,
} from '../../../core/services/firebase-services.service';
import { BookingService } from '../../../core/services/booking.service';
import { BookingValidationService } from '../../../core/services/booking-validation.service';

export interface ServiceSelectionDetails {
  date: string;
  time: string;
  clientName: string;
  email: string;
}

@Component({
  selector: 'pelu-service-selection-popup',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TranslateModule,
    PopularBadgeComponent,
    PopupDialogComponent,
  ],
  templateUrl: './service-selection-popup.component.html',
  styleUrls: ['./service-selection-popup.component.scss'],
})
export class ServiceSelectionPopupComponent {
  private readonly toastService = inject(ToastService);
  private readonly serviceTranslationService = inject(ServiceTranslationService);
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly bookingService = inject(BookingService);
  private readonly translateService = inject(TranslateService);
  private readonly bookingValidationService = inject(BookingValidationService);

  // Input signals
  @Input() set open(value: boolean) {
    this.isOpenSignal.set(value);
  }
  @Input() set selectionDetails(value: ServiceSelectionDetails) {
    this.selectionDetailsSignal.set(value);
  }

  // Output events
  @Output() serviceSelected = new EventEmitter<{
    details: ServiceSelectionDetails;
    service: FirebaseService;
  }>();
  @Output() cancelled = new EventEmitter<void>();

  // Internal signals
  private readonly isOpenSignal = signal<boolean>(false);
  private readonly selectionDetailsSignal = signal<ServiceSelectionDetails>({
    date: '',
    time: '',
    clientName: '',
    email: '',
  });
  private readonly selectedServiceSignal = signal<FirebaseService | null>(null);

  // Computed signals
  readonly isOpen = computed(() => this.isOpenSignal());
  readonly selectionDetailsComputed = computed(() => this.selectionDetailsSignal());
  readonly selectedService = computed(() => this.selectedServiceSignal());

  // Available services from centralized service
  readonly availableServices = computed(() => this.firebaseServicesService.activeServices());

  // Filter services that can be booked at the selected time
  readonly bookableServices = computed(() => {
    const details = this.selectionDetailsComputed();
    if (!details.date || !details.time) {
      return this.availableServices();
    }

    const bookingDate = new Date(details.date);
    const allBookings = this.bookingService.bookings();

    return this.availableServices().filter(service =>
      this.bookingValidationService.canBookServiceAtTime(
        bookingDate,
        details.time,
        service.duration,
        allBookings
      )
    );
  });

  // Recently booked services (3 most recent unique services)
  readonly recentlyBookedServices = computed(() => {
    const recentServiceIds = this.bookingService.getRecentlyBookedServices();
    return this.bookableServices().filter(service =>
      recentServiceIds.includes(service.id || '')
    );
  });

  // Popular services (services with popular flag, but not recently booked)
  readonly popularServices = computed(() => {
    const recentServiceIds = this.bookingService.getRecentlyBookedServices();
    return this.bookableServices().filter(service =>
      service.isPopular === true &&
      !recentServiceIds.includes(service.id || '')
    );
  });

  // Other services (non-popular services and not recently booked)
  readonly otherServices = computed(() => {
    const recentServiceIds = this.bookingService.getRecentlyBookedServices();
    return this.bookableServices().filter(service =>
      service.isPopular !== true &&
      !recentServiceIds.includes(service.id || '')
    );
  });

  // Popup dialog configuration
  readonly dialogConfig = computed<PopupDialogConfig>(() => ({
    title: this.getPopupTitle(),
    size: 'large',
    closeOnBackdropClick: true,
    showFooter: true,
    footerActions: [
      {
        label: this.translateService.instant('COMMON.ACTIONS.CONTINUE'),
        type: 'confirm' as const,
        disabled: !this.selectedService(),
        action: () => this.onConfirm()
      }
    ]
  }));

  // Get dynamic popup title based on selection details
  private getPopupTitle(): string {
    const details = this.selectionDetailsComputed();
    if (details.date && details.time) {
      return this.translateService.instant('COMMON.SELECTION.AVAILABLE_SERVICES_FOR_TIME');
    }
    return this.translateService.instant('COMMON.SELECTION.SELECT_SERVICE');
  }

  // Methods
  onServiceSelect(service: FirebaseService): void {
    this.selectedServiceSignal.set(service);
  }

  onConfirm(): void {
    const selectedService = this.selectedService();
    if (!selectedService) {
      this.toastService.showError('COMMON.SELECTION.PLEASE_SELECT_SERVICE');
      return;
    }

    this.serviceSelected.emit({
      details: this.selectionDetailsComputed(),
      service: selectedService
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ca-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getServiceName(service: FirebaseService): string {
    return service.name;
  }

  getServiceDescription(service: FirebaseService): string {
    return service.description;
  }
}
