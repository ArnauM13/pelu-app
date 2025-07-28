import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from '../../../shared/components/card/card.component';
import {
  InfoItemComponent,
  InfoItemData,
} from '../../../shared/components/info-item/info-item.component';
import { AuthService } from '../../../core/auth/auth.service';
import {
  DetailViewComponent,
  DetailViewConfig,
  DetailAction,
  InfoSection,
} from '../../../shared/components/detail-view/detail-view.component';
import { AppointmentDetailPopupComponent } from '../../../shared/components/appointment-detail-popup/appointment-detail-popup.component';
import {
  AlertPopupComponent,
  AlertData,
} from '../../../shared/components/alert-popup/alert-popup.component';
import { CurrencyService } from '../../../core/services/currency.service';
import { ToastService } from '../../../shared/services/toast.service';
import { BookingService, Booking } from '../../../core/services/booking.service';
import {
  isFutureAppointment,
  migrateOldAppointments,
  needsMigration,
  saveMigratedAppointments,
} from '../../../shared/services';

interface AppointmentForm {
  nom: string;
  data: string;
  hora: string;
  notes?: string;
  servei?: string;
  preu?: number;
  duration?: number;
  serviceName?: string;
  serviceId?: string;
}

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
  // Inject services

  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #location = inject(Location);
  #authService = inject(AuthService);
  #currencyService = inject(CurrencyService);
  #toastService = inject(ToastService);
  #bookingService = inject(BookingService);
  #appointmentService = inject(BookingService);

  // Core data signals
  #appointmentSignal = signal<any>(null);
  #loadingSignal = signal<boolean>(true);
  #notFoundSignal = signal<boolean>(false);

  // Edit mode signals
  #isEditingSignal = signal<boolean>(false);
  #editFormSignal = signal<AppointmentForm>({
    nom: '',
    data: '',
    hora: '',
    notes: '',
    servei: '',
    preu: 0,
  });

  // Delete confirmation signals
  #showDeleteAlertSignal = signal<boolean>(false);
  #deleteAlertDataSignal = signal<AlertData | null>(null);

  // Public computed signals
  readonly appointment = computed(() => this.#appointmentSignal());
  readonly loading = computed(() => this.#loadingSignal());
  readonly notFound = computed(() => this.#notFoundSignal());
  readonly isEditing = computed(() => this.#isEditingSignal());
  readonly editForm = computed(() => this.#editFormSignal());
  readonly showDeleteAlert = computed(() => this.#showDeleteAlertSignal());
  readonly deleteAlertData = computed(() => this.#deleteAlertDataSignal());

  // Computed properties
  readonly appointmentInfoItems = computed(() => {
    const cita = this.appointment();
    if (!cita) return [];

    const items: InfoItemData[] = [
      {
        icon: '👤',
        label: 'COMMON.CLIENT',
        value: cita.nom,
      },
      {
        icon: '📅',
        label: 'COMMON.DATE',
        value: this.formatDate(cita.data),
      },
    ];

    if (cita.hora) {
      items.push({
        icon: '⏰',
        label: 'COMMON.TIME',
        value: this.formatTime(cita.hora),
      });
    }

    if (cita.servei) {
      items.push({
        icon: '✂️',
        label: 'COMMON.SERVICE',
        value: cita.servei,
      });
    }

    if (cita.serviceName) {
      items.push({
        icon: '✂️',
        label: 'COMMON.SERVICE',
        value: cita.serviceName,
      });
    }

    if (cita.duration) {
      items.push({
        icon: '⏱️',
        label: 'APPOINTMENTS.DURATION',
        value: `${cita.duration} min`,
      });
    }

    if (cita.preu) {
      items.push({
        icon: '💰',
        label: 'APPOINTMENTS.PRICE',
        value: this.#currencyService.formatPrice(cita.preu),
      });
    }

    if (cita.notes) {
      items.push({
        icon: '📝',
        label: 'APPOINTMENTS.NOTES',
        value: cita.notes,
      });
    }

    return items;
  });

  readonly isToday = computed(() => {
    const cita = this.appointment();
    if (!cita) return false;
    return this.isTodayDate(cita.data);
  });

  readonly isPast = computed(() => {
    const cita = this.appointment();
    if (!cita) return false;
    return this.isPastDate(cita.data);
  });

  readonly statusBadge = computed(() => {
    if (this.isToday()) return { text: 'COMMON.TIME.TODAY', class: 'today' };
    if (this.isPast()) return { text: 'COMMON.TIME.PAST', class: 'past' };
    return { text: 'COMMON.TIME.UPCOMING', class: 'upcoming' };
  });

  readonly canSave = computed(() => {
    const form = this.editForm();
    return form.nom.trim() !== '' && form.data !== '';
  });

  readonly hasChanges = computed(() => {
    const cita = this.appointment();
    const form = this.editForm();
    if (!cita) return false;

    return (
      cita.nom !== form.nom ||
      cita.data !== form.data ||
      cita.hora !== form.hora ||
      cita.notes !== form.notes ||
      cita.servei !== form.servei ||
      cita.preu !== form.preu ||
      cita.duration !== form.duration ||
      cita.serviceName !== form.serviceName ||
      cita.serviceId !== form.serviceId
    );
  });

  readonly canEditOrDelete = computed(() => {
    const cita = this.appointment();
    if (!cita) return false;

    // Verificar que l'usuari actual és el propietari
    const currentUser = this.#authService.user();
    if (!currentUser?.uid) return false;

    // Verificar propietat
    const isOwner = cita.uid === currentUser.uid;
    if (!isOwner) return false;

    // Si és una reserva (té editToken), sempre es pot editar
    if (cita.editToken) {
      return true;
    }

    // Per a cites normals, verificar que és una cita futura
    return isFutureAppointment({ data: cita.data || '', hora: cita.hora || '' });
  });

  readonly canDelete = computed(() => {
    const cita = this.appointment();
    if (!cita) return false;

    // Verificar que l'usuari actual és el propietari
    const currentUser = this.#authService.user();
    if (!currentUser?.uid) return false;

    // Verificar propietat
    const isOwner = cita.uid === currentUser.uid;
    if (!isOwner) return false;

    // No permetem eliminar reserves des d'aquí
    if (cita.editToken) {
      return false;
    }

    // Per a cites normals, verificar que és una cita futura
    return isFutureAppointment({ data: cita.data || '', hora: cita.hora || '' });
  });

  // Detail page configuration
  readonly detailConfig = computed((): DetailViewConfig => {
    const isEditing = this.isEditing();
    const editForm = this.editForm();
    const hasChanges = this.hasChanges();
    const canSave = this.canSave();
    const canEditOrDelete = this.canEditOrDelete();
    const canDelete = this.canDelete();

    // Build actions reactively
    const actions: DetailAction[] = [
      {
        label: 'COMMON.ACTIONS.BACK',
        icon: '←',
        type: 'secondary',
        onClick: () => this.goBack(),
      },
    ];

    // Add edit action if user can edit
    if (canEditOrDelete && !isEditing) {
      actions.push({
        label: 'COMMON.ACTIONS.EDIT',
        icon: '✏️',
        type: 'primary',
        onClick: () => this.startEditing(),
      });
    }

    // Add delete action if user can delete
    if (canDelete && !isEditing) {
      actions.push({
        label: 'COMMON.ACTIONS.DELETE',
        icon: '🗑️',
        type: 'danger',
        onClick: () => this.showDeleteConfirmation(),
      });
    }

    return {
      type: 'appointment',
      loading: this.loading(),
      notFound: this.notFound(),
      appointment: this.appointment(),
      infoSections: [
        {
          title: 'APPOINTMENTS.APPOINTMENT_DETAILS',
          items: this.appointmentInfoItems(),
        },
      ],
      actions: actions,
      editForm: editForm,
      isEditing: isEditing,
      hasChanges: hasChanges,
      canSave: canSave,
    };
  });

  constructor() {}

  ngOnInit() {
    this.loadAppointment();

    // Check if we should start in edit mode
    this.#route.queryParams.subscribe(params => {
      if (params['edit'] === 'true') {
        // Wait for appointment to be loaded, then start editing
        const checkAppointment = () => {
          if (this.appointment()) {
            this.startEditing();
          } else {
            // If appointment is not loaded yet, wait a bit and try again
            setTimeout(checkAppointment, 100);
          }
        };
        checkAppointment();
      }
    });
  }

  private async loadAppointment() {
    const uniqueId = this.#route.snapshot.paramMap.get('id');
    const token = this.#route.snapshot.queryParams['token'];
    const editMode = this.#route.snapshot.queryParams['edit'] === 'true';

    if (!uniqueId) {
      this.#notFoundSignal.set(true);
      this.#loadingSignal.set(false);
      return;
    }

    // Si hi ha un token, intentem carregar una reserva
    if (token) {
      await this.loadBookingByToken(token);
      // Si estem en mode edició, iniciem l'edició automàticament
      if (editMode) {
        setTimeout(() => this.startEditing(), 100);
      }
      return;
    }

    // Si l'ID comença amb "booking-", és una reserva sense token (no hauria de passar)
    if (uniqueId.startsWith('booking-')) {
      this.#notFoundSignal.set(true);
      this.#loadingSignal.set(false);
      return;
    }

    // Sinó, carreguem una cita normal
    await this.loadAppointmentById(uniqueId);

    // Si estem en mode edició, iniciem l'edició automàticament
    if (editMode) {
      setTimeout(() => this.startEditing(), 100);
    }
  }

  private async loadBookingByToken(token: string) {
    try {
      const currentUser = this.#authService.user();

      // If user is authenticated, try to load from their bookings first
      if (currentUser?.uid) {
        const userBookings = this.#bookingService.bookings();
        const userBooking = userBookings.find(booking => booking.editToken === token);

        if (userBooking) {
          const appointment = this.convertBookingToAppointment(userBooking);
          this.#appointmentSignal.set(appointment);
          this.#editFormSignal.set({
            nom: appointment.nom || '',
            data: appointment.data || '',
            hora: appointment.hora || '',
            notes: appointment.notes || '',
            servei: appointment.servei || '',
            preu: appointment.preu || 0,
            duration: appointment.duration || 0,
            serviceName: appointment.serviceName || '',
            serviceId: appointment.serviceId || '',
          });
          this.#loadingSignal.set(false);
          return;
        }
      }

      // Load booking by token for authenticated users
      const booking = await this.#bookingService.getBookingById(token);
      if (!booking) {
        this.#notFoundSignal.set(true);
        this.#loadingSignal.set(false);
        return;
      }

      // Convertir la reserva al format de cita
      const appointment = this.convertBookingToAppointment(booking);

      if (appointment) {
        this.#appointmentSignal.set(appointment);
        this.#editFormSignal.set({
          nom: appointment.nom || '',
          data: appointment.data || '',
          hora: appointment.hora || '',
          notes: appointment.notes || '',
          servei: appointment.servei || '',
          preu: appointment.preu || 0,
          duration: appointment.duration || 0,
          serviceName: appointment.serviceName || '',
          serviceId: appointment.serviceId || '',
        });
      }
      this.#loadingSignal.set(false);
    } catch (error) {
      console.error('Error loading booking by token:', error);
      this.#notFoundSignal.set(true);
      this.#loadingSignal.set(false);
    }
  }

  private async loadAppointmentById(uniqueId: string) {
    try {
      // Check if it's the old format (clientId-appointmentId) for backward compatibility
      if (uniqueId.includes('-') && !uniqueId.startsWith('booking-')) {
        const parts = uniqueId.split('-');
        if (parts.length === 2) {
          const clientId = parts[0];
          const appointmentId = parts[1];

          // Verify that the client ID matches the current user
          const currentUser = this.#authService.user();
          if (!currentUser?.uid || currentUser.uid !== clientId) {
            throw new Error('Access denied');
          }

          // Load from Firebase using the appointment ID
          const appointment = await this.#appointmentService.getBookingById(appointmentId);

          if (!appointment) {
            this.#notFoundSignal.set(true);
            return;
          }

          this.#appointmentSignal.set(appointment);
          this.#editFormSignal.set({
            nom: appointment.nom || '',
            data: appointment.data || '',
            hora: appointment.hora || '',
            notes: appointment.notes || '',
            servei: appointment.servei || '',
            preu: appointment.preu || 0,
            duration: appointment.duration || 0,
            serviceName: appointment.serviceName || '',
            serviceId: appointment.serviceId || '',
          });
          return;
        }
      }

      // If it's a direct ID (new format), try to load it directly
      const currentUser = this.#authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      // Load from Firebase (bookings collection) - try booking service first
      let appointment = await this.#bookingService.getBookingById(uniqueId);

      if (!appointment) {
        // Fallback to appointment service
        appointment = await this.#appointmentService.getBookingById(uniqueId);
      }

      if (!appointment) {
        this.#notFoundSignal.set(true);
        return;
      }

      this.#appointmentSignal.set(appointment);
      this.#editFormSignal.set({
        nom: appointment.nom || '',
        data: appointment.data || '',
        hora: appointment.hora || '',
        notes: appointment.notes || '',
        servei: appointment.servei || '',
        preu: appointment.preu || 0,
        duration: appointment.duration || 0,
        serviceName: appointment.serviceName || '',
        serviceId: appointment.serviceId || '',
      });
    } catch (error) {
      console.error('Error loading appointment:', error);
      this.#notFoundSignal.set(true);
    } finally {
      this.#loadingSignal.set(false);
    }
  }

  private convertBookingToAppointment(booking: any): any {
    return {
      id: booking.id,
      nom: booking.nom || booking.title || booking.clientName || '',
      data: booking.data || booking.start?.split('T')[0] || '',
      hora: booking.hora || booking.start?.split('T')[1]?.substring(0, 5) || '',
      notes: booking.notes || '',
      servei: booking.serviceName || booking.servei || '',
      serviceName: booking.serviceName || booking.servei || '',
      serviceId: booking.serviceId || '',
      preu: booking.price || booking.preu || 0,
      duration: booking.duration || 60,
      status: booking.status || 'confirmed',
      userId: booking.uid || booking.userId || '',
      editToken: booking.editToken,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  startEditing() {
    const cita = this.appointment();
    if (!cita) return;

    this.#editFormSignal.set({
      nom: cita.nom || '',
      data: cita.data || '',
      hora: cita.hora || '',
      notes: cita.notes || '',
      servei: cita.servei || '',
      preu: cita.preu || 0,
      duration: cita.duration || 60,
      serviceName: cita.serviceName || '',
      serviceId: cita.serviceId || '',
    });
    this.#isEditingSignal.set(true);
  }

  cancelEditing() {
    this.#isEditingSignal.set(false);
    this.#editFormSignal.set({
      nom: '',
      data: '',
      hora: '',
      notes: '',
      servei: '',
      preu: 0,
      duration: 60,
      serviceName: '',
      serviceId: '',
    });
  }

  async saveAppointment() {
    const cita = this.appointment();
    const form = this.editForm();

    if (!cita || !this.canSave()) return;

    // Si és una reserva (té editToken), desem via BookingService
    if (cita.editToken) {
      await this.saveBooking(cita, form);
      return;
    }

    // Sinó, desem com a cita normal
    await this.saveAppointmentToLocalStorage(cita, form);
  }

  private async saveBooking(cita: any, form: any) {
    const currentUser = this.#authService.user();
    const token = this.#route.snapshot.queryParams['token'];

    if (!token) {
      this.#toastService.showError("No s'ha pogut guardar la reserva. Token invàlid.");
      return;
    }

    const updates = {
      nom: form.nom.trim(),
      data: form.data,
      hora: form.hora,
      notes: form.notes?.trim() || '',
      serviceName: form.serviceName?.trim() || '',
      serviceId: form.serviceId || '',
    };

    // Only authenticated users can update bookings
    if (!currentUser?.uid) {
      this.#toastService.showError("No s'ha pogut guardar la reserva. Si us plau, inicia sessió.");
      return;
    }

    const success = await this.#bookingService.updateBooking(cita.id!, updates);

    if (success) {
      // Actualitzar l'estat local
      const updatedAppointment = {
        ...cita,
        ...updates,
      };
      this.#appointmentSignal.set(updatedAppointment);
      this.#isEditingSignal.set(false);

      // Show success message
      const clientName = updatedAppointment.nom || 'Client';
      this.#toastService.showAppointmentUpdated(clientName);
    }
  }

  private async saveAppointmentToLocalStorage(cita: any, form: any) {
    const user = this.#authService.user();
    if (!user) {
      this.#toastService.showError("No s'ha pogut guardar la cita. Si us plau, inicia sessió.");
      return;
    }

    const updates = {
      nom: form.nom.trim(),
      data: form.data,
      hora: form.hora,
      notes: form.notes?.trim() || '',
      servei: form.servei?.trim() || '',
      preu: form.preu || 0,
      duration: form.duration || 60,
      serviceName: form.serviceName?.trim() || '',
      serviceId: form.serviceId || '',
    };

    const success = await this.#appointmentService.updateBooking(cita.id!, updates);

    if (success) {
      // Update local state
      const updatedAppointment = {
        ...cita,
        ...updates,
      };
      this.#appointmentSignal.set(updatedAppointment);
      this.#isEditingSignal.set(false);

      // Show success message
      const clientName = updatedAppointment.nom || 'Client';
      this.#toastService.showAppointmentUpdated(clientName);

      // Trigger custom event for calendar update
      window.dispatchEvent(new CustomEvent('appointmentUpdated', { detail: updatedAppointment }));
    }
  }

  showDeleteConfirmation() {
    const cita = this.appointment();
    if (!cita) return;

    const clientName = cita.nom || 'Client';
    const appointmentDate = this.formatDate(cita.data);

    const alertData: AlertData = {
      title: 'APPOINTMENTS.DELETE_CONFIRMATION_TITLE',
      message: `Estàs segur que vols eliminar la cita de ${clientName} del ${appointmentDate}? Aquesta acció no es pot desfer.`,
      emoji: '⚠️',
      severity: 'danger',
      confirmText: 'COMMON.ACTIONS.DELETE',
      cancelText: 'COMMON.ACTIONS.CANCEL',
      showCancel: true,
    };

    this.#deleteAlertDataSignal.set(alertData);
    this.#showDeleteAlertSignal.set(true);
  }

  onDeleteConfirmed() {
    this.#showDeleteAlertSignal.set(false);
    this.#deleteAlertDataSignal.set(null);
    this.deleteAppointment();
  }

  onDeleteCancelled() {
    this.#showDeleteAlertSignal.set(false);
    this.#deleteAlertDataSignal.set(null);
  }

  async deleteAppointment() {
    const cita = this.appointment();
    if (!cita) return;

    // Si és una reserva (té editToken), no permetem eliminar des d'aquí
    if (cita.editToken) {
      this.#toastService.showError("No es pot eliminar una reserva des d'aquesta pàgina.");
      return;
    }

    const success = await this.#appointmentService.deleteBooking(cita.id!);

    if (success) {
      // Show success message
      const clientName = cita.nom || 'Client';
      this.#toastService.showAppointmentDeleted(clientName);

      // Trigger custom event for calendar update
      window.dispatchEvent(new CustomEvent('appointmentDeleted', { detail: cita }));

      this.goBack();
    }
  }

  goBack() {
    this.#location.back();
  }

  // Form update methods
  updateForm(field: string, value: any) {
    this.#editFormSignal.update(form => ({
      ...form,
      [field]: value,
    }));
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

  onToastClick(event: any) {
    const appointmentId = event.message?.data?.appointmentId;
    if (appointmentId) {
      const user = this.#authService.user();
      if (!user?.uid) {
        return;
      }

      // Generem un ID únic combinant clientId i appointmentId
      const clientId = user.uid;
      const uniqueId = `${clientId}-${appointmentId}`;

      this.#router.navigate(['/appointments', uniqueId]);
    }
  }

  viewAppointmentDetail(appointmentId: string) {
    const user = this.#authService.user();
    if (!user?.uid) {
      return;
    }

    // Generem un ID únic combinant clientId i appointmentId
    const clientId = user.uid;
    const uniqueId = `${clientId}-${appointmentId}`;

    this.#router.navigate(['/appointments', uniqueId]);
  }

  onPopupClosed() {
    // No action needed when popup is closed from detail page
  }
}
