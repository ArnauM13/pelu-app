import { Component, input, computed, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { DetailViewComponent, DetailViewConfig } from '../../../shared/components/detail-view/detail-view.component';
import { AppointmentManagementService } from '../../../core/services/appointment-management.service';
import { BookingForm } from '../../../core/interfaces/booking.interface';

@Component({
  selector: 'pelu-appointment-detail-view',
  imports: [
    CommonModule,
    TranslateModule,
    DetailViewComponent,
  ],
  template: `
    <pelu-detail-view
      [config]="detailConfig()"
      [appointmentId]="appointmentId()"
      (back)="onBack()"
      (edit)="onEdit()"
      (save)="onSave($event)"
      (cancelEdit)="onCancelEdit()"
      (delete)="onDelete()"
      (updateForm)="onUpdateForm($event)"
    >
    </pelu-detail-view>
  `,
  styleUrls: ['./appointment-detail-view.component.scss'],
})
export class AppointmentDetailViewComponent implements OnDestroy {
  // Input signals
  readonly appointmentId = input<string | null>(null);

  // Inject services
  #router = inject(Router);
  #route = inject(ActivatedRoute);
  #appointmentManagementService = inject(AppointmentManagementService);
  #destroy$ = new Subject<void>();

  // Computed properties from service
  readonly appointment = this.#appointmentManagementService.appointment;
  readonly service = this.#appointmentManagementService.service;
  readonly isLoading = this.#appointmentManagementService.isLoading;
  readonly isEditing = this.#appointmentManagementService.isEditing;
  readonly hasChanges = this.#appointmentManagementService.hasChanges;
  readonly canEdit = this.#appointmentManagementService.canEdit;
  readonly canDelete = this.#appointmentManagementService.canDelete;

  // Computed configuration for detail view
  readonly detailConfig = computed((): DetailViewConfig => {
    const appointment = this.appointment();
    const service = this.service();

    return {
      type: 'appointment',
      loading: this.isLoading(),
      notFound: !appointment && !this.isLoading(),
      appointment: appointment || undefined,
      infoSections: [
        {
          title: 'APPOINTMENTS.APPOINTMENT_DETAILS',
          items: [
            {
              icon: '👤',
              label: 'COMMON.CLIENT',
              value: appointment?.clientName || 'N/A',
            },
            {
              icon: '📅',
              label: 'COMMON.DATE',
              value: appointment?.data ? this.formatDate(appointment.data) : 'N/A',
            },
            {
              icon: '⏰',
              label: 'COMMON.TIME',
              value: appointment?.hora || 'N/A',
            },
            {
              icon: '✂️',
              label: 'COMMON.SERVICE',
              value: service?.name || 'N/A',
            },
            {
              icon: '⏱️',
              label: 'APPOINTMENTS.DURATION',
              value: service?.duration ? this.formatDuration(service.duration) : 'N/A',
            },
            {
              icon: '💰',
              label: 'APPOINTMENTS.PRICE',
              value: service?.price ? this.formatPrice(service.price) : 'N/A',
            },
            ...(appointment?.notes ? [{
              icon: '📝',
              label: 'APPOINTMENTS.NOTES',
              value: appointment.notes,
            }] : []),
          ],
        },
      ],
      actions: [
        {
          label: 'COMMON.ACTIONS.BACK',
          icon: '←',
          type: 'secondary' as const,
          onClick: () => this.onBack(),
        },
        ...(this.canEdit() ? [{
          label: 'COMMON.ACTIONS.EDIT',
          icon: '✏️',
          type: 'primary' as const,
          onClick: () => this.onEdit(),
        }] : []),
        ...(this.canDelete() ? [{
          label: 'COMMON.ACTIONS.DELETE',
          icon: '🗑️',
          type: 'danger' as const,
          onClick: () => this.onDelete(),
        }] : []),
      ],
      isEditing: this.isEditing(),
      hasChanges: this.hasChanges(),
      canSave: this.hasChanges(),
    };
  });

  constructor() {
    // Load appointment when component initializes
    effect(() => {
      const appointmentId = this.appointmentId();
      if (appointmentId) {
        this.#appointmentManagementService.loadAppointment(appointmentId);
      }
    });

    // Load from route parameters using observable
    effect(() => {
      const appointmentId = this.appointmentId();
      if (!appointmentId) {
        // Subscribe to route parameter changes
        this.#route.paramMap.pipe(
          map(params => params.get('id')),
          takeUntil(this.#destroy$)
        ).subscribe(routeId => {
          if (routeId) {
            this.#appointmentManagementService.loadAppointment(routeId);
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  // Event handlers
  onBack(): void {
    this.#router.navigate(['/appointments']);
  }

  onEdit(): void {
    this.#appointmentManagementService.startEditing();
  }

  onSave(_formData: BookingForm): void {
    this.#appointmentManagementService.saveAppointment();
  }

  onCancelEdit(): void {
    this.#appointmentManagementService.cancelEditing();
  }

  onDelete(): void {
    this.#appointmentManagementService.deleteAppointment();
  }

  onUpdateForm(event: { field: string; value: string | number }): void {
    this.#appointmentManagementService.updateForm(event.field as keyof BookingForm, event.value);
  }

  // Utility methods
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDuration(duration: number): string {
    if (duration < 60) {
      return `${duration} min`;
    }
    const hours = Math.floor(duration / 60);
    const remainingMinutes = duration % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  }

  formatPrice(price: number): string {
    return `${price}€`;
  }
}
