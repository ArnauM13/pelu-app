import { Component, input, output, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';

import { AvatarComponent } from '../avatar/avatar.component';
import { AppointmentStatusBadgeComponent } from '../appointment-status-badge/appointment-status-badge.component';
import { NotFoundStateComponent } from '../not-found-state/not-found-state.component';

import { InputTextComponent } from '../inputs/input-text/input-text.component';
import { InputTextareaComponent } from '../inputs/input-textarea/input-textarea.component';
import { InputDateComponent } from '../inputs/input-date/input-date.component';
import { InputSelectComponent, SelectOption } from '../inputs/input-select/input-select.component';
import { ActionsButtonsComponent } from '../actions-buttons/actions-buttons.component';
import { ButtonComponent } from '../buttons/button.component';
import { ServiceCardComponent } from '../service-card/service-card.component';
import { CardComponent } from '../card/card.component';

import { AppointmentManagementService } from '../../../core/services/appointment-management.service';
import { ServicesService } from '../../../core/services/services.service';
import { ToastService } from '../../services/toast.service';
import { ActionsService, ActionContext } from '../../../core/services/actions.service';
import { BookingValidationService } from '../../../core/services/booking-validation.service';
import { FirebaseServicesService } from '../../../core/services/firebase-services.service';
import { IcsUtils } from '../../utils/ics.utils';
import { User } from '../../../core/interfaces/user.interface';
import { Booking, BookingForm } from '../../../core/interfaces/booking.interface';
import { TimeSlot } from '../../utils/time.utils';

export interface DetailAction {
  label: string;
  icon: string;
  type?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  disabled?: boolean;
  routerLink?: string;
}

export interface InfoSection {
  title: string;
  items: InfoItemData[];
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export interface InfoItemData {
  icon: string;
  label: string;
  value: string;
  isEditable?: boolean;
  field?: keyof BookingForm;
  type?: 'text' | 'date' | 'time' | 'select';
  options?: { label: string; value: string }[];
}

export interface DetailViewConfig {
  type: 'profile' | 'appointment';
  loading: boolean;
  notFound: boolean;
  user?: User;
  appointment?: Booking;
  infoSections: InfoSection[];
  actions: DetailAction[];
  editForm?: BookingForm;
  isEditing?: boolean;
  hasChanges?: boolean;
  canSave?: boolean;
}

@Component({
  selector: 'pelu-detail-view',
  imports: [
    CommonModule,
    TranslateModule,
    InputTextModule,
    TooltipModule,
    AvatarComponent,
    AppointmentStatusBadgeComponent,
    NotFoundStateComponent,

    RouterModule,
    InputTextComponent,
    InputTextareaComponent,
    InputDateComponent,
    InputSelectComponent,
    ActionsButtonsComponent,
    ButtonComponent,
    ServiceCardComponent,
    CardComponent,
  ],
  templateUrl: './detail-view.component.html',
  styleUrls: ['./detail-view.component.scss'],
})
export class DetailViewComponent {
  // Input signals
  readonly config = input<DetailViewConfig>();
  readonly appointmentId = input<string | null>(null);

  // Output signals
  readonly back = output<void>();
  readonly edit = output<void>();
  readonly save = output<BookingForm>();
  readonly cancelEdit = output<void>();
  readonly delete = output<void>();
  readonly updateForm = output<{ field: string; value: string | number }>();

  // Inject services
  #router = inject(Router);
  #appointmentManagementService = inject(AppointmentManagementService);
  #servicesService = inject(ServicesService);
  #toastService = inject(ToastService);
  #actionsService = inject(ActionsService);
  #bookingValidationService = inject(BookingValidationService);
  #firebaseServicesService = inject(FirebaseServicesService);

  // Computed properties from service
  readonly appointment = this.#appointmentManagementService.appointment;
  readonly service = this.#appointmentManagementService.service;
  readonly isLoading = this.#appointmentManagementService.isLoading;
  readonly isEditing = this.#appointmentManagementService.isEditing;
  readonly hasChanges = this.#appointmentManagementService.hasChanges;
  readonly canEdit = this.#appointmentManagementService.canEdit;
  readonly canDelete = this.#appointmentManagementService.canDelete;
  readonly availableTimeSlots = this.#appointmentManagementService.availableTimeSlots;
  readonly availableServices = this.#appointmentManagementService.availableServices;
  readonly availableDays = this.#appointmentManagementService.availableDays;

  // Computed properties for template
  readonly type = computed(() => this.config()?.type || 'appointment');
  readonly notFound = computed(() => this.config()?.notFound || false);
  readonly user = computed(() => this.config()?.user);
  readonly actions = computed(() => this.config()?.actions || []);
  readonly infoSections = computed(() => this.config()?.infoSections || []);

  readonly filteredActions = computed(() => {
    return this.actions().filter(
      action =>
        action.label !== 'COMMON.BACK' &&
        action.label !== 'Back' &&
        action.label !== 'Tornar endarrere'
    );
  });

  readonly hasAvailableActions = computed(() => {
    // No mostrar accions si estem en mode edició
    if (this.isEditing()) return false;

    // Comprovar si hi ha accions generals disponibles (excloent el botó de tornar)
    const hasGeneralActions = this.filteredActions().length > 0;

    // Comprovar si hi ha accions específiques de cites disponibles
    const hasAppointmentActions =
      this.type() === 'appointment' &&
      this.appointment() &&
      (this.canEdit() || this.canDelete());

    // Mostrar la columna d'accions només si hi ha accions generals O accions específiques de cites
    return hasGeneralActions || hasAppointmentActions;
  });

  readonly hasAppointmentActions = computed(() => {
    return (
      this.type() === 'appointment' &&
      this.appointment() &&
      (this.canEdit() || this.canDelete())
    );
  });

  readonly hasGeneralActions = computed(() => {
    return this.filteredActions().length > 0;
  });

  // Computed properties for available time slots and dates
  readonly availableTimeSlotOptions = computed((): SelectOption[] => {
    const timeSlots = this.availableTimeSlots();
    const currentAppointment = this.appointment();
    const isEditing = this.isEditing();

    // If not editing, return empty array
    if (!isEditing) {
      return [];
    }

    // If no time slots available, show message
    if (timeSlots.length === 0) {
      const currentTime = currentAppointment?.hora;
      if (currentTime) {
        return [{
          label: `${currentTime} (hora actual)`,
          value: currentTime,
          disabled: false,
          icon: '📍',
          description: 'Hora actual de la reserva'
        }];
      }
      return [{
        label: 'No hi ha hores disponibles per aquesta data',
        value: '',
        disabled: true,
        icon: '⚠️',
        description: 'Selecciona una altra data'
      }];
    }

    // Add current appointment time if it's not in the available slots
    const currentTime = currentAppointment?.hora;
    const hasCurrentTime = timeSlots.some(slot => slot.time === currentTime);

    let options = timeSlots.map(slot => ({
      label: slot.time,
      value: slot.time,
      disabled: !slot.available,
      icon: slot.available ? '🕐' : '❌',
      description: slot.available
        ? 'Disponible'
        : slot.clientName
          ? `Ocupat per ${slot.clientName}`
          : 'No disponible'
    }));

    // Add current time if it's not in the list (for editing existing appointments)
    if (currentTime && !hasCurrentTime) {
      options.unshift({
        label: `${currentTime} (hora actual)`,
        value: currentTime,
        disabled: false,
        icon: '📍',
        description: 'Hora actual de la reserva'
      });
    }

    return options;
  });

  readonly availableDateOptions = computed((): SelectOption[] => {
    const availableDays = this.availableDays();
    const currentAppointment = this.appointment();

    return availableDays.map(day => {
      const dateString = this.formatDateForInput(day);
      const isCurrentDate = currentAppointment?.data === dateString;

      return {
        label: this.formatDate(dateString),
        value: dateString,
        disabled: false,
        icon: isCurrentDate ? '📅' : '📆',
        description: isCurrentDate ? 'Data actual' : 'Disponible'
      };
    });
  });

  readonly minDate = computed(() => {
    const today = new Date();
    return today;
  });

  readonly maxDate = computed(() => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 365); // 1 year ahead
    return maxDate;
  });

  readonly isLoadingTimeSlots = computed(() => {
    return this.isEditing() && this.availableTimeSlots().length === 0 && !!this.appointment()?.data && !!this.appointment()?.serviceId;
  });

  // Profile specific computed properties
  readonly avatarData = computed(() => {
    const user = this.user();
    if (!user) return null;

    // Parse displayName to separate name and surname
    const displayName = (user as User & { displayName?: string }).displayName || '';
    const nameParts = displayName.split(' ');
    const name = nameParts[0] || '';
    const surname = nameParts.slice(1).join(' ') || '';

    return {
      name: name,
      surname: surname,
      email: user.email || '',
      imageUrl: (user as User & { photoURL?: string }).photoURL || '',
    };
  });

  // Appointment client avatar data
  readonly appointmentClientAvatarData = computed(() => {
    const appointment = this.appointment();
    if (!appointment) return null;

    // Parse clientName to separate name and surname
    const clientName = appointment.clientName || '';
    const nameParts = clientName.split(' ');
    const name = nameParts[0] || '';
    const surname = nameParts.slice(1).join(' ') || '';

    // Try to get photo URL from the appointment data (if loaded by AppointmentManagementService)
    const appointmentWithService = appointment as Booking & { clientPhotoURL?: string };
    const photoURL = appointmentWithService?.clientPhotoURL || '';

    return {
      name: name,
      surname: surname,
      email: appointment.email || '',
      imageUrl: photoURL,
    };
  });

  readonly displayName = computed(() => {
    const user = this.user();
    return (user as User & { displayName?: string })?.displayName || user?.email?.split('@')[0] || 'COMMON.USER';
  });

  readonly email = computed(() => {
    return this.user()?.email || 'COMMON.NOT_AVAILABLE';
  });

  // Appointment title and subtitle (similar to profile)
  readonly appointmentTitle = computed(() => {
    const appointment = this.appointment();
    return appointment?.clientName || 'COMMON.NOT_AVAILABLE';
  });

  readonly appointmentSubtitle = computed(() => {
    const appointment = this.appointment();
    if (!appointment?.data || !appointment?.hora) {
      return 'COMMON.NOT_AVAILABLE';
    }
    const formattedDate = this.formatDate(appointment.data);
    const formattedTime = this.formatTime(appointment.hora);
    return `${formattedDate} - ${formattedTime}`;
  });

  // Appointment specific computed properties
  readonly statusBadge = computed(() => {
    const appointment = this.appointment();
    if (!appointment) return { text: '', class: '' };

    const today = new Date();
    const appointmentDate = new Date(appointment.data);

    if (appointmentDate.toDateString() === today.toDateString()) {
      return { text: 'COMMON.TIME.TODAY', class: 'today' };
    } else if (appointmentDate < today) {
      return { text: 'COMMON.TIME.PAST', class: 'past' };
    } else {
      return { text: 'COMMON.TIME.UPCOMING', class: 'upcoming' };
    }
  });

  // Service color gradient for appointment detail page
  readonly serviceGradient = computed(() => {
    if (this.type() !== 'appointment' || !this.appointment()) {
      return 'linear-gradient(135deg, var(--background-color) 0%, var(--secondary-color-light) 100%)';
    }

    const service = this.service();
    if (!service) {
      return 'linear-gradient(135deg, #ffffff 0%, var(--service-default-bg) 100%)';
    }

    const serviceColor = this.#servicesService.getServiceColor(service);
    return `linear-gradient(135deg, #ffffff 0%, ${serviceColor.backgroundColor} 100%)`;
  });

  // Service color gradient for appointment header
  readonly appointmentHeaderGradient = computed(() => {
    if (this.type() !== 'appointment' || !this.appointment()) {
      return 'var(--gradient-header-detail)';
    }

    const service = this.service();
    if (!service) {
      return 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, var(--service-default-bg) 100%)';
    }

    const serviceColor = this.#servicesService.getServiceColor(service);
    return `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, ${serviceColor.backgroundColor} 100%)`;
  });

  // Not found states
  readonly notFoundConfig = computed(() => {
    return {
      icon: this.type() === 'profile' ? '👤' : '📅',
      title: this.type() === 'profile' ? 'PROFILE.NOT_FOUND' : 'APPOINTMENTS.NOT_FOUND',
      message: this.type() === 'profile' ? 'AUTH.LOGIN_TO_VIEW_PROFILE' : 'COMMON.NO_DATA',
      buttonText: 'COMMON.BACK',
      showButton: true,
    };
  });

  readonly loadingConfig = computed(() => {
    return {
      message: 'COMMON.STATUS.LOADING',
      spinnerSize: 'large' as const,
      showMessage: true,
      fullHeight: true,
      overlay: true,
    };
  });

  // View transitions and toast keys
  readonly viewTransitionName = computed(() => `${this.type()}-container`);
  readonly cardTransitionName = computed(() => `${this.type()}-card`);
  readonly contentTransitionName = computed(() => `${this.type()}-content`);
  readonly toastKey = computed(() => `${this.type()}-detail-toast`);

  // Action context for the actions service
  readonly actionContext = computed<ActionContext | null>(() => {
    if (this.type() === 'appointment' && this.appointment()) {
      return {
        type: 'appointment',
        item: this.appointment()!,
        permissions: {
          canEdit: this.canEdit(),
          canDelete: this.canDelete(),
          canView: false, // Disable view action in detail view
        },
        onEdit: () => this.onEdit(),
        onDelete: () => this.onDelete(),
        onView: () => this.onBack(),
      };
    }
    return null;
  });

  constructor() {
    // Load appointment when component initializes
    effect(() => {
      const appointmentId = this.appointmentId();
      if (appointmentId) {
        this.#appointmentManagementService.loadAppointment(appointmentId);
      }
    });

    // Load available days and time slots when editing starts
    effect(() => {
      if (this.isEditing()) {
        // Load available days and time slots when editing starts
        this.#appointmentManagementService.loadAvailableDays();
        // Load time slots for the current appointment date
        const appointment = this.appointment();
        if (appointment?.data) {
          this.#appointmentManagementService.loadAvailableTimeSlotsForDate(appointment.data);
        }
      }
    });
  }

  // Event handlers
  onBack(): void {
    this.back.emit();
  }

  onEdit(): void {
    this.edit.emit();
  }

  onSave(): void {
    const appointment = this.appointment();
    if (appointment) {
      this.save.emit({
        clientName: appointment.clientName || '',
        email: appointment.email || '',
        data: appointment.data || '',
        hora: appointment.hora || '',
        notes: appointment.notes || '',
        serviceId: appointment.serviceId || ''
      });
    }
  }

  onCancelEdit(): void {
    this.cancelEdit.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }

  onUpdateForm(field: string, value: string | number | Date | null): void {
    // Convert Date to string if needed
    let processedValue: string | number;

    if (value instanceof Date) {
      processedValue = value.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
    } else if (value === null) {
      processedValue = '';
    } else {
      processedValue = value;
    }

    this.updateForm.emit({ field, value: processedValue });
  }

  // Utility methods
  formatDate(dateString: string): string {
    try {
      const date = parseISO(dateString);
      return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ca });
    } catch {
      return dateString;
    }
  }

  formatDateForInput(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  formatTime(timeString: string): string {
    return timeString;
  }

  // Toast methods
  onToastClick(event: Record<string, unknown>): void {
    const eventData = event['data'] as { showViewButton?: boolean; appointmentId?: string };
    if (eventData?.showViewButton && eventData?.appointmentId) {
      this.viewAppointmentDetail(eventData.appointmentId);
    }
  }

  viewAppointmentDetail(appointmentId: string): void {
    this.#appointmentManagementService.navigateToAppointment(appointmentId);
  }

  /**
   * Downloads ICS file with appointment details and opens calendar
   */
  async downloadIcsFile(): Promise<void> {
    const appointment = this.appointment();

    if (!appointment) {
      this.#toastService.showError('COMMON.ERROR', 'COMMON.BOOKING_NOT_FOUND');
      return;
    }

    try {
      // Get service details from the appointment
      const service = await this.#firebaseServicesService.getServiceById(appointment.serviceId);

      if (!service) {
        this.#toastService.showError('COMMON.ERROR', 'COMMON.SERVICE_NOT_FOUND');
        return;
      }

      const icsData = {
        clientName: appointment.clientName,
        email: appointment.email,
        date: appointment.data,
        time: appointment.hora,
        serviceName: service.name,
        duration: service.duration,
        price: service.price,
        businessName: 'PeluApp',
        businessAddress: '',
        businessPhone: ''
      };

      const icsContent = IcsUtils.generateIcsContent(icsData);
      const filename = IcsUtils.generateFilename(
        appointment.clientName,
        appointment.data,
        service.name
      );

      // Download and open calendar
      await IcsUtils.downloadAndOpenCalendar(icsContent, filename);
      this.#toastService.showSuccess('COMMON.SUCCESS', 'COMMON.ICS_DOWNLOAD_SUCCESS');
    } catch (error) {
      console.error('Error generating ICS file:', error);
      this.#toastService.showError('COMMON.ERROR', 'COMMON.ICS_GENERATION_ERROR');
    }
  }
}
