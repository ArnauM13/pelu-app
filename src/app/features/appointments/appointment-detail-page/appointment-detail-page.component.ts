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
import { DetailViewComponent, DetailViewConfig, DetailAction, InfoItemData } from '../../../shared/components/detail-view/detail-view.component';
import { AppointmentDetailPopupComponent } from '../../../shared/components/appointment-detail-popup/appointment-detail-popup.component';
import { ConfirmationPopupComponent, type ConfirmationData } from '../../../shared/components/confirmation-popup/confirmation-popup.component';
import { CurrencyService } from '../../../core/services/currency.service';
import { AppointmentDetailService } from '../../../core/services/appointment-detail.service';
import { AppointmentDetailData } from '../../../core/interfaces/booking.interface';
import { ServicesService } from '../../../core/services/services.service';
import { Service } from '../../../core/services/services.service';
import { Booking } from '../../../core/interfaces/booking.interface';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { AppointmentManagementService } from '../../../core/services/appointment-management.service';
import { LoaderService } from '../../../shared/services/loader.service';

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
    ConfirmationPopupComponent,
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
  private appointmentManagementService = inject(AppointmentManagementService);
  private loaderService = inject(LoaderService);

  // Public computed signals from service
  readonly booking = this.appointmentManagementService.appointment;
  readonly isLoading = this.appointmentManagementService.isLoading;
  readonly canEdit = this.appointmentManagementService.canEdit;
  readonly canDelete = this.appointmentManagementService.canDelete;

  // Mobile detection
  readonly isMobile = computed(() => this.responsiveService.isMobile());

  // Service data
  private loadedService = signal<Service | null>(null);
  readonly service = computed(() => this.loadedService());

  // Appointment ID for detail view
  readonly appointmentId = computed(() => this.route.snapshot.paramMap.get('id'));



  // UI state signals
  private showDeleteAlertSignal = signal<boolean>(false);
  private deleteAlertDataSignal = signal<ConfirmationData | null>(null);

  readonly showDeleteAlert = computed(() => this.showDeleteAlertSignal());
  readonly deleteAlertData = computed(() => this.deleteAlertDataSignal());

  // Computed properties for display
  readonly appointmentInfoItems = computed(() => {
    const booking = this.booking();
    if (!booking) return [];

    const items: InfoItemData[] = [
      {
        icon: '👤',
        label: 'COMMON.CLIENT_NAME',
        value: booking.clientName,
        field: 'clientName',
      },
      {
        icon: '📅',
        label: 'COMMON.DATE',
        value: this.formatDate(booking.data),
        field: 'data',
      },
      {
        icon: '⏰',
        label: 'COMMON.HOURS',
        value: this.formatTime(booking.hora),
        field: 'hora',
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
        label: 'COMMON.NOTES',
        value: booking.notes,
        field: 'notes',
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
        label: 'APPOINTMENTS.EDIT_APPOINTMENT_DETAILS',
        icon: '✏️',
        type: 'primary',
        onClick: () => this.editAppointment(),
      });
    }

    if (canDelete) {
      actions.push({
        label: 'APPOINTMENTS.ACTIONS.DELETE_CONFIRMATION',
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

    // Auto-trigger delete confirmation if requested via query param
    const confirmDelete = this.route.snapshot.queryParamMap.get('confirmDelete');
    if (confirmDelete === 'true') {
      // Defer to allow booking to load if needed
      setTimeout(() => this.showDeleteConfirmation(), 0);
    }


  }

  private async loadAppointment(): Promise<void> {
    const appointmentId = this.route.snapshot.paramMap.get('id');
    if (appointmentId) {
      this.loaderService.show({ message: 'APPOINTMENTS.LOADING_APPOINTMENT' });

      try {
        await this.appointmentManagementService.loadAppointment(appointmentId);
        // Load service data after booking is loaded
        await this.loadServiceData();
      } catch (error) {
        console.error('Error loading appointment:', error);
      } finally {
        this.loaderService.hide();
      }
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

    const alertData: ConfirmationData = {
      title: 'APPOINTMENTS.DELETE_CONFIRMATION_TITLE',
      message: 'APPOINTMENTS.DELETE_CONFIRMATION_MESSAGE',
      severity: 'danger',
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
    this.loaderService.show({ message: 'APPOINTMENTS.DELETING_APPOINTMENT' });

    try {
      await this.appointmentManagementService.deleteAppointment();
      this.goBack();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    } finally {
      this.loaderService.hide();
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

  onEditRequested(): void {
    // Use the appointment management service to start editing in-place
    this.appointmentManagementService.startEditing();
  }

  editAppointment(): void {
    // This method is used by the DetailViewConfig actions
    this.onEditRequested();
  }
}

