import { Component, inject, OnInit, computed, signal, Input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { TranslateModule } from '@ngx-translate/core';
import { InfoItemData } from '../../../shared/components/info-item/info-item.component';
import { DetailViewComponent, DetailViewConfig, DetailAction } from '../../../shared/components/detail-view/detail-view.component';
import { AppointmentDetailPopupComponent } from '../../../shared/components/appointment-detail-popup/appointment-detail-popup.component';
import { AlertPopupComponent, AlertData } from '../../../shared/components/alert-popup/alert-popup.component';
import { CurrencyService } from '../../../core/services/currency.service';
import { AppointmentDetailService } from '../../../core/services/appointment-detail.service';
import { AppointmentDetailData } from '../../../core/interfaces/booking.interface';
import { ServicesService } from '../../../core/services/services.service';
import { Service } from '../../../core/services/services.service';
import { Booking } from '../../../core/interfaces/booking.interface';
import { ResponsiveService } from '../../../core/services/responsive.service';

@Component({
  selector: 'pelu-appointment-detail-page',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ToastModule,
    TooltipModule,
    InputTextModule,
    DatePickerModule,
    TranslateModule,
    DetailViewComponent,
    AppointmentDetailPopupComponent,
    AlertPopupComponent,
  ],
  templateUrl: './appointment-detail-page.component.html',
  styleUrls: ['./appointment-detail-page.component.scss'],
})
export class AppointmentDetailPageComponent implements OnInit {
  // Input for receiving appointment data
  @Input() appointmentData?: AppointmentDetailData;

  // Inject services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private currencyService = inject(CurrencyService);
  private appointmentDetailService = inject(AppointmentDetailService);
  private servicesService = inject(ServicesService);
  private responsiveService = inject(ResponsiveService);

  // Public computed signals from service
  readonly booking = this.appointmentDetailService.booking;
  readonly isLoading = this.appointmentDetailService.isLoading;
  readonly canEdit = this.appointmentDetailService.canEdit;
  readonly canDelete = this.appointmentDetailService.canDelete;

  // Mobile detection
  readonly isMobile = computed(() => this.responsiveService.isMobile());

  // Service data
  private loadedService = signal<Service | null>(null);
  readonly service = computed(() => this.loadedService());

  // UI state signals
  private showDeleteAlertSignal = signal<boolean>(false);
  private deleteAlertDataSignal = signal<AlertData | null>(null);

  readonly showDeleteAlert = computed(() => this.showDeleteAlertSignal());
  readonly deleteAlertData = computed(() => this.deleteAlertDataSignal());

  // Computed properties for display
  readonly appointmentInfoItems = computed(() => {
    const booking = this.booking();
    if (!booking) return [];

    const items: InfoItemData[] = [
      {
        icon: '👤',
        label: 'COMMON.CLIENT',
        value: booking.clientName,
      },
      {
        icon: '📅',
        label: 'COMMON.DATE',
        value: this.formatDate(booking.data),
      },
      {
        icon: '⏰',
        label: 'COMMON.TIME.TODAY',
        value: this.formatTime(booking.hora),
      },
      {
        icon: '✂️',
        label: 'COMMON.SERVICE',
        value: 'Service', // Will be fetched from service service
      },
      {
        icon: '⏱️',
        label: 'APPOINTMENTS.DURATION',
        value: 'Duration', // Will be fetched from service service
      },
      {
        icon: '💰',
        label: 'APPOINTMENTS.PRICE',
        value: 'Price', // Will be fetched from service service
      },
    ];

    if (booking.notes) {
      items.push({
        icon: '📝',
        label: 'APPOINTMENTS.NOTES',
        value: booking.notes,
      });
    }

    return items;
  });

  readonly isToday = computed(() => {
    const booking = this.booking();
    if (!booking) return false;
    return this.isTodayDate(booking.data);
  });

  readonly isPast = computed(() => {
    const booking = this.booking();
    if (!booking) return false;
    return this.isPastDate(booking.data);
  });

  readonly statusBadge = computed(() => {
    if (this.isToday()) return { text: 'COMMON.TIME.TODAY', class: 'today' };
    if (this.isPast()) return { text: 'COMMON.TIME.PAST', class: 'past' };
    return { text: 'COMMON.TIME.UPCOMING', class: 'upcoming' };
  });

  // Detail page configuration
  readonly detailConfig = computed((): DetailViewConfig => {
    const canEdit = this.canEdit();
    const canDelete = this.canDelete();

    const actions: DetailAction[] = [
      {
        label: 'COMMON.ACTIONS.BACK',
        icon: '←',
        type: 'secondary',
        onClick: () => this.goBack(),
      },
    ];

    if (canEdit) {
      actions.push({
        label: 'COMMON.ACTIONS.EDIT',
        icon: '✏️',
        type: 'primary',
        onClick: () => this.editAppointment(),
      });
    }

    if (canDelete) {
      actions.push({
        label: 'COMMON.ACTIONS.DELETE',
        icon: '🗑️',
        type: 'danger',
        onClick: () => this.showDeleteConfirmation(),
      });
    }

    return {
      type: 'appointment',
      loading: this.isLoading(),
      notFound: !this.booking(),
      appointment: this.booking() || undefined,
      infoSections: [
        {
          title: 'APPOINTMENTS.APPOINTMENT_DETAILS',
          items: this.appointmentInfoItems(),
        },
      ],
      actions: actions,
    };
  });

  ngOnInit() {
    // Load from route parameters
    this.loadAppointment();
  }

  private async loadAppointment(): Promise<void> {
    const appointmentId = this.route.snapshot.paramMap.get('id');
    if (appointmentId) {
      await this.appointmentDetailService.loadBookingById(appointmentId);
      // Load service data after booking is loaded
      await this.loadServiceData();
    }
  }

  private async loadServiceData(): Promise<void> {
    const booking = this.booking();
    if (booking?.serviceId) {
      try {
        const service = await this.servicesService.getServiceById(booking.serviceId);
        this.loadedService.set(service);
      } catch (error) {
        console.error('Error loading service:', error);
        this.loadedService.set(null);
      }
    } else {
      this.loadedService.set(null);
    }
  }

  showDeleteConfirmation(): void {
    const booking = this.booking();
    if (!booking) return;

    const clientName = booking.clientName || 'Client';
    const appointmentDate = this.formatDate(booking.data);

    const alertData: AlertData = {
      title: 'APPOINTMENTS.DELETE_CONFIRMATION_TITLE',
      message: `Estàs segur que vols eliminar la cita de ${clientName} del ${appointmentDate}? Aquesta acció no es pot desfer.`,
      emoji: '⚠️',
      severity: 'danger',
      confirmText: 'COMMON.ACTIONS.DELETE',
      cancelText: 'COMMON.ACTIONS.CANCEL',
      showCancel: true,
    };

    this.deleteAlertDataSignal.set(alertData);
    this.showDeleteAlertSignal.set(true);
  }

  onDeleteConfirmed(): void {
    this.showDeleteAlertSignal.set(false);
    this.deleteAlertDataSignal.set(null);
    this.deleteAppointment();
  }

  onDeleteCancelled(): void {
    this.showDeleteAlertSignal.set(false);
    this.deleteAlertDataSignal.set(null);
  }

  async deleteAppointment(): Promise<void> {
    const success = await this.appointmentDetailService.deleteBooking();
    if (success) {
      this.goBack();
    }
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/appointments']);
    }
  }

  // Utility methods
  formatDate(dateString: string): string {
    try {
      return format(parseISO(dateString), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ca });
    } catch {
      return dateString;
    }
  }

  formatTime(timeString: string): string {
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  }

  isTodayDate(dateString: string): boolean {
    const today = format(new Date(), 'yyyy-MM-dd');
    return dateString === today;
  }

  isPastDate(dateString: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    return appointmentDate < today;
  }

  onToastClick(event: { message?: { data?: { appointmentId?: string } } }): void {
    const appointmentId = event.message?.data?.appointmentId;
    if (appointmentId) {
      // Use the appointmentId directly as it should be a UUID
      this.router.navigate(['/appointments', appointmentId]);
    }
  }

  viewAppointmentDetail(appointmentId: string): void {
    // Use the appointmentId directly as it should be a UUID
    this.router.navigate(['/appointments', appointmentId]);
  }

  onViewDetailRequested(booking: Booking): void {
    // Handle view detail request from popup - navigate to detail page
    this.router.navigate(['/appointments', booking.id]);
  }

  editAppointment(): void {
    this.router.navigate(['/appointments', this.booking()?.id, 'edit']);
  }
}

