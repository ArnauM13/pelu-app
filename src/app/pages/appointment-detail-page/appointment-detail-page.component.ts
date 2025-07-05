import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { CardComponent } from '../../shared/components/card/card.component';
import { InfoItemComponent, InfoItemData } from '../../shared/components/info-item/info-item.component';
import { AuthService } from '../../auth/auth.service';

interface AppointmentForm {
  nom: string;
  data: string;
  hora: string;
  notes?: string;
  servei?: string;
  preu?: number;
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
    CardComponent,
    InfoItemComponent
  ],
  providers: [MessageService],
  templateUrl: './appointment-detail-page.component.html',
  styleUrls: ['./appointment-detail-page.component.scss']
})
export class AppointmentDetailPageComponent implements OnInit {
  // Inject services
  #messageService = inject(MessageService);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
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
           cita.preu !== form.preu;
  });

  constructor() {}

  ngOnInit() {
    this.loadAppointment();
  }

  private loadAppointment() {
    const appointmentId = this.#route.snapshot.paramMap.get('id');

    if (!appointmentId) {
      this.#notFoundSignal.set(true);
      this.#loadingSignal.set(false);
      return;
    }

    const appointments = JSON.parse(localStorage.getItem('cites') || '[]');
    const appointment = appointments.find((cita: any) => cita.id === appointmentId);

    if (!appointment) {
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
      preu: cita.preu || 0
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
      preu: 0
    });
  }

  saveAppointment() {
    const cita = this.appointment();
    const form = this.editForm();

    if (!cita || !this.canSave()) return;

    const user = this.#authService.user();
    if (!user) {
      this.#messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No s\'ha pogut guardar la cita. Si us plau, inicia sessió.',
        life: 3000
      });
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
      userId: user.uid
    };

    const appointments = JSON.parse(localStorage.getItem('cites') || '[]');
    const updatedAppointments = appointments.map((app: any) =>
      app.id === cita.id ? updatedAppointment : app
    );

    localStorage.setItem('cites', JSON.stringify(updatedAppointments));
    this.#appointmentSignal.set(updatedAppointment);
    this.#isEditingSignal.set(false);

    this.#messageService.add({
      severity: 'success',
      summary: 'Cita actualitzada',
      detail: `S'ha actualitzat la cita de ${updatedAppointment.nom}`,
      life: 3000
    });
  }

  deleteAppointment() {
    const cita = this.appointment();
    if (!cita) return;

    const appointments = JSON.parse(localStorage.getItem('cites') || '[]');
    const updatedAppointments = appointments.filter((app: any) => app.id !== cita.id);
    localStorage.setItem('cites', JSON.stringify(updatedAppointments));

    this.#messageService.add({
      severity: 'success',
      summary: 'Cita eliminada',
      detail: `S'ha eliminat la cita de ${cita.nom}`,
      life: 3000
    });

    this.#router.navigate(['/appointments']);
  }

  goBack() {
    this.#router.navigate(['/appointments']);
  }

  // Form update methods
  updateForm(field: keyof AppointmentForm, value: any) {
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
}
