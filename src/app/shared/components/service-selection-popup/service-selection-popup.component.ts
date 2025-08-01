import { Component, EventEmitter, Input, Output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PopularBadgeComponent } from '../popular-badge/popular-badge.component';
import { PopupDialogComponent, PopupDialogConfig, FooterActionType } from '../popup-dialog/popup-dialog.component';
import { ToastService } from '../../services/toast.service';
import { ServiceTranslationService } from '../../../core/services/service-translation.service';
import {
  FirebaseService,
  FirebaseServicesService,
} from '../../../core/services/firebase-services.service';

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
  private readonly translateService = inject(TranslateService);

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

  // Popular services (services with popular flag)
  readonly popularServices = computed(() =>
    this.availableServices().filter(service => service.popular === true)
  );

  // Other services (non-popular services)
  readonly otherServices = computed(() =>
    this.availableServices().filter(service => service.popular !== true)
  );

  // Popup dialog configuration
  readonly dialogConfig = computed<PopupDialogConfig>(() => ({
    title: this.translateService.instant('COMMON.SELECTION.SELECT_SERVICE'),
    size: 'large',
    closeOnBackdropClick: true,
    showFooter: true,
    footerActions: [
      {
        label: this.translateService.instant('COMMON.ACTIONS.CONFIRM'),
        type: 'confirm' as const,
        disabled: !this.selectedService(),
        action: () => this.onConfirm()
      }
    ]
  }));

  // Methods
  onServiceSelect(service: FirebaseService): void {
    this.selectedServiceSignal.set(service);
  }

  onConfirm(): void {
    const selectedService = this.selectedService();
    if (!selectedService) {
      this.toastService.showValidationError('servei');
      return;
    }

    this.serviceSelected.emit({
      details: this.selectionDetailsComputed(),
      service: selectedService,
    });
  }

  onCancel(): void {
    this.selectedServiceSignal.set(null);
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
    return this.serviceTranslationService.translateServiceName(service.name);
  }

  getServiceDescription(service: FirebaseService): string {
    return service.description || this.serviceTranslationService.translateServiceName(service.name);
  }
}
