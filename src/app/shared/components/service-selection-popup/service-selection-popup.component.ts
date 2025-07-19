import { Component, EventEmitter, Input, Output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';
import { ServiceTranslationService } from '../../../core/services/service-translation.service';
import { Service } from '../../../core/services/services.service';

export interface ServiceSelectionDetails {
  date: string;
  time: string;
  clientName: string;
  email: string;
}



@Component({
  selector: 'pelu-service-selection-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TranslateModule
  ],
  templateUrl: './service-selection-popup.component.html',
  styleUrls: ['./service-selection-popup.component.scss']
})
export class ServiceSelectionPopupComponent {
  private readonly toastService = inject(ToastService);
  private readonly serviceTranslationService = inject(ServiceTranslationService);

  // Input signals
  @Input() set open(value: boolean) {
    this.isOpenSignal.set(value);
  }
  @Input() set selectionDetails(value: ServiceSelectionDetails) {
    this.selectionDetailsSignal.set(value);
  }

  // Output events
  @Output() serviceSelected = new EventEmitter<{details: ServiceSelectionDetails, service: Service}>();
  @Output() cancelled = new EventEmitter<void>();

  // Internal signals
  private readonly isOpenSignal = signal<boolean>(false);
  private readonly selectionDetailsSignal = signal<ServiceSelectionDetails>({
    date: '',
    time: '',
    clientName: '',
    email: ''
  });
  private readonly selectedServiceSignal = signal<Service | null>(null);

  // Computed signals
  readonly isOpen = computed(() => this.isOpenSignal());
  readonly selectionDetailsComputed = computed(() => this.selectionDetailsSignal());
  readonly selectedService = computed(() => this.selectedServiceSignal());

  // Available services (mock data - replace with service call)
  readonly availableServices = computed(() => [
    {
      id: '1',
      name: 'SERVICES.NAMES.MALE_HAIRCUT',
      description: 'Tall de cabell clàssic o modern segons les teves preferències',
      price: 25,
      duration: 30,
      category: 'haircut' as const,
      icon: '💇‍♀️',
      popular: true
    },
    {
      id: '2',
      name: 'SERVICES.NAMES.COLORING',
      description: 'Tintura professional amb productes de qualitat',
      price: 45,
      duration: 90,
      category: 'treatment' as const,
      icon: '🎨'
    },
    {
      id: '3',
      name: 'SERVICES.NAMES.BEARD_TRIM',
      description: 'Arreglada de barba professional',
      price: 20,
      duration: 45,
      category: 'beard' as const,
      icon: '💅'
    },
    {
      id: '4',
      name: 'SERVICES.NAMES.SPECIAL_STYLING',
      description: 'Pentinat especial per a ocasions especials',
      price: 30,
      duration: 60,
      category: 'styling' as const,
      icon: '🦶'
    }
  ]);

  // Methods
  onServiceSelect(service: Service): void {
    this.selectedServiceSignal.set(service);
  }

  selectService(service: Service): void {
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
      service: selectedService
    });
    this.resetState();
  }

  onCancel(): void {
    this.cancelled.emit();
    this.resetState();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  canConfirm(): boolean {
    return !!this.selectedService();
  }

  private resetState(): void {
    this.selectedServiceSignal.set(null);
  }

  // Helper methods
  getServiceName(service: Service): string {
    // Use the service translation service to get the translated name
    return this.serviceTranslationService.translateServiceName(service.name);
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  }

  formatPrice(price: number): string {
    return `${price}€`;
  }

  formatDate(date: string): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('ca-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
