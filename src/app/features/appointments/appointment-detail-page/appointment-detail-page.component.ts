import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from '../../../shared/components/card/card.component';
import { InfoItemComponent, InfoItemData } from '../../../shared/components/info-item/info-item.component';
import { AuthService } from '../../../core/auth/auth.service';
import { DetailViewComponent, DetailViewConfig, DetailAction, InfoSection } from '../../../shared/components/detail-view/detail-view.component';

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
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ToastModule,
    TooltipModule,
    InputTextModule,
    CalendarModule,
    TranslateModule,
    DetailViewComponent
  ],
  providers: [MessageService],
  templateUrl: './appointment-detail-page.component.html',
  styleUrls: ['./appointment-detail-page.component.scss']
})
export class AppointmentDetailPageComponent implements OnInit {
  // Inject services
  public readonly messageService = inject(MessageService);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #location = inject(Location);
  #authService = inject(AuthService);

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
    preu: 0
  });

  // Public computed signals
  readonly appointment = computed(() => this.#appointmentSignal());
  readonly loading = computed(() => this.#loadingSignal());
  readonly notFound = computed(() => this.#notFoundSignal());
  readonly isEditing = computed(() => this.#isEditingSignal());
  readonly editForm = computed(() => this.#editFormSignal());

  // Computed properties
  readonly appointmentInfoItems = computed(() => {
    const cita = this.appointment();
    if (!cita) return [];

    const items: InfoItemData[] = [
      {
        icon: '👤',
        label: 'COMMON.CLIENT',
        value: cita.nom
      },
      {
        icon: '📅',
        label: 'COMMON.DATE',
        value: this.formatDate(cita.data)
      }
    ];

    if (cita.hora) {
      items.push({
        icon: '⏰',
        label: 'COMMON.TIME',
        value: this.formatTime(cita.hora)
      });
    }

    if (cita.servei) {
      items.push({
        icon: '✂️',
        label: 'APPOINTMENTS.SERVICE',
        value: cita.servei
      });
    }

    if (cita.serviceName) {
      items.push({
        icon: '✂️',
        label: 'APPOINTMENTS.SERVICE',
        value: cita.serviceName
      });
    }

    if (cita.duration) {
      items.push({
        icon: '⏱️',
        label: 'APPOINTMENTS.DURATION',
        value: `${cita.duration} min`
      });
    }

    if (cita.preu) {
      items.push({
        icon: '💰',
        label: 'APPOINTMENTS.PRICE',
        value: `${cita.preu}€`
      });
    }

    if (cita.notes) {
      items.push({
        icon: '📝',
        label: 'APPOINTMENTS.NOTES',
        value: cita.notes
      });
    }

    if (cita.userId) {
      items.push({
        icon: '👨‍💼',
        label: 'COMMON.USER',
        value: cita.userId
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
    if (this.isToday()) return { text: 'COMMON.TODAY', class: 'today' };
    if (this.isPast()) return { text: 'COMMON.PAST', class: 'past' };
    return { text: 'COMMON.UPCOMING', class: 'upcoming' };
  });

  readonly canSave = computed(() => {
    const form = this.editForm();
    return form.nom.trim() !== '' && form.data !== '';
  });

  readonly hasChanges = computed(() => {
    const cita = this.appointment();
    const form = this.editForm();
    if (!cita) return false;

    return cita.nom !== form.nom ||
           cita.data !== form.data ||
           cita.hora !== form.hora ||
           cita.notes !== form.notes ||
           cita.servei !== form.servei ||
           cita.preu !== form.preu ||
           cita.duration !== form.duration ||
           cita.serviceName !== form.serviceName ||
           cita.serviceId !== form.serviceId;
  });

  // Detail page configuration
  readonly detailConfig = computed((): DetailViewConfig => ({
    type: 'appointment',
    loading: this.loading(),
    notFound: this.notFound(),
    appointment: this.appointment(),
    infoSections: [
      {
        title: 'APPOINTMENTS.APPOINTMENT_DETAILS',
        items: this.appointmentInfoItems()
      }
    ],
    actions: this.getActions(),
    editForm: this.editForm(),
    isEditing: this.isEditing(),
    hasChanges: this.hasChanges(),
    canSave: this.canSave()
  }));

  private getActions(): DetailAction[] {
    return [
      {
        label: 'COMMON.BACK',
        icon: '←',
        type: 'secondary',
        onClick: () => this.goBack()
      },
      {
        label: 'COMMON.EDIT',
        icon: '✏️',
        type: 'primary',
        onClick: () => this.startEditing(),
        disabled: this.isEditing()
      },
      {
        label: 'COMMON.DELETE',
        icon: '🗑️',
        type: 'danger',
        onClick: () => this.deleteAppointment()
      }
    ];
  }

  constructor() {}

  ngOnInit() {
    this.loadAppointment();
  }

  private loadAppointment() {
    const uniqueId = this.#route.snapshot.paramMap.get('id');

    if (!uniqueId) {
      this.#notFoundSignal.set(true);
      this.#loadingSignal.set(false);
      return;
    }

    const appointments = JSON.parse(localStorage.getItem('cites') || '[]');

    // Parsegem l'ID únic: format "clientId-appointmentId"
    const parts = uniqueId.split('-');

    if (parts.length < 2) {
      this.#notFoundSignal.set(true);
      this.#loadingSignal.set(false);
      return;
    }

    const clientId = parts[0];
    const appointmentId = parts.slice(1).join('-'); // En cas que l'appointmentId tingui guions

    // Verifiquem que l'usuari actual coincideix amb el clientId
    const currentUser = this.#authService.user();
    if (!currentUser || currentUser.uid !== clientId) {
      this.#notFoundSignal.set(true);
      this.#loadingSignal.set(false);
      return;
    }

    // Busquem la cita per l'ID
    const appointment = appointments.find((cita: any) => cita.id === appointmentId);

    if (!appointment) {
      this.#notFoundSignal.set(true);
      this.#loadingSignal.set(false);
      return;
    }

    // Verifiquem que la cita pertany a l'usuari actual
    if (appointment.userId !== currentUser.uid) {
      this.#notFoundSignal.set(true);
      this.#loadingSignal.set(false);
      return;
    }

    this.#appointmentSignal.set(appointment);
    this.#loadingSignal.set(false);
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
      serviceId: cita.serviceId || ''
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
      serviceId: ''
    });
  }

  saveAppointment() {
    const cita = this.appointment();
    const form = this.editForm();

    if (!cita || !this.canSave()) return;

    const user = this.#authService.user();
    if (!user) {
      this.showToast('error', '❌ Error', 'No s\'ha pogut guardar la cita. Si us plau, inicia sessió.');
      return;
    }

    const updatedAppointment = {
      ...cita,
      nom: form.nom.trim(),
      data: form.data,
      hora: form.hora,
      notes: form.notes?.trim() || '',
      servei: form.servei?.trim() || '',
      preu: form.preu || 0,
      duration: form.duration || 60,
      serviceName: form.serviceName?.trim() || '',
      serviceId: form.serviceId || '',
      userId: user.uid
    };

    const appointments = JSON.parse(localStorage.getItem('cites') || '[]');
    const updatedAppointments = appointments.map((app: any) =>
      app.id === cita.id ? updatedAppointment : app
    );

    localStorage.setItem('cites', JSON.stringify(updatedAppointments));
    this.#appointmentSignal.set(updatedAppointment);
    this.#isEditingSignal.set(false);

    this.showToast('success', '✅ Cita actualitzada', `S'ha actualitzat la cita de ${updatedAppointment.nom}`, updatedAppointment.id, true);
  }

  deleteAppointment() {
    const cita = this.appointment();
    if (!cita) return;

    const appointments = JSON.parse(localStorage.getItem('cites') || '[]');
    const updatedAppointments = appointments.filter((app: any) => app.id !== cita.id);
    localStorage.setItem('cites', JSON.stringify(updatedAppointments));

    this.showToast('success', '🗑️ Cita eliminada', `S'ha eliminat la cita de ${cita.nom}`, cita.id);

    this.goBack();
  }

  goBack() {
    this.#location.back();
  }

  // Form update methods
  updateForm(field: string, value: any) {
    this.#editFormSignal.update(form => ({
      ...form,
      [field]: value
    }));
  }

  // Utility methods
  formatDate(dateString: string): string {
    try {
      return format(parseISO(dateString), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: ca });
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

  private showToast(severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string, appointmentId?: string, showViewButton: boolean = false) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 4000,
      closable: false,
      key: 'appointment-detail-toast',
      data: { appointmentId, showViewButton }
    });
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
}
