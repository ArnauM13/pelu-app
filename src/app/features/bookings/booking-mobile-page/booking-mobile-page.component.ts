import { Component, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { v4 as uuidv4 } from 'uuid';
import { TranslateModule } from '@ngx-translate/core';
import { addDays, format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ca } from 'date-fns/locale';
import { AuthService } from '../../../core/auth/auth.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BookingPopupComponent, BookingDetails } from '../../../shared/components/booking-popup/booking-popup.component';
import { ServicesService, Service } from '../../../core/services/services.service';

interface DaySlot {
  date: Date;
  timeSlots: TimeSlot[];
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: any;
  isLunchBreak: boolean;
  isPastTime?: boolean;
}

@Component({
  selector: 'pelu-booking-mobile-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    DropdownModule,
    TranslateModule,
    CardComponent,
    BookingPopupComponent,
  ],
  templateUrl: './booking-mobile-page.component.html',
  styleUrls: ['./booking-mobile-page.component.scss']
})
export class BookingMobilePageComponent {
  // Inject services
  public readonly messageService = inject(MessageService);
  public readonly authService = inject(AuthService);
  public readonly servicesService = inject(ServicesService);
  private readonly router = inject(Router);

  // Internal state signals
  private readonly selectedDateSignal = signal<Date>(new Date());
  private readonly selectedServiceSignal = signal<Service | null>(null);
  private readonly appointmentsSignal = signal<any[]>([]);
  private readonly showBookingPopupSignal = signal<boolean>(false);
  private readonly bookingDetailsSignal = signal<BookingDetails>({date: '', time: '', clientName: ''});

  // Public computed signals
  readonly selectedDate = computed(() => this.selectedDateSignal());
  readonly selectedService = computed(() => this.selectedServiceSignal() || undefined);
  readonly appointments = computed(() => this.appointmentsSignal());
  readonly showBookingPopup = computed(() => this.showBookingPopupSignal());
  readonly bookingDetails = computed(() => this.bookingDetailsSignal());

  // Business configuration
  readonly businessHours = { start: '08:00', end: '20:00' };
  readonly lunchBreak = { start: '13:00', end: '14:00' };
  readonly businessDays = [1, 2, 3, 4, 5, 6]; // Monday to Saturday
  readonly slotDuration = 30; // minutes

  // Computed properties
  readonly weekDays = computed(() => {
    const start = startOfWeek(this.selectedDate(), { weekStartsOn: 1 });
    const end = endOfWeek(this.selectedDate(), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  });

  readonly selectedDaySlots = computed(() => {
    return this.generateTimeSlotsForDay(this.selectedDate());
  });

  readonly morningSlots = computed(() => {
    return this.selectedDaySlots().filter(slot => {
      const slotTime = slot.time;
      const lunchStart = this.lunchBreak.start;
      return slotTime < lunchStart; // Matí: fins l'inici de l'hora de dinar
    });
  });

  readonly afternoonSlots = computed(() => {
    return this.selectedDaySlots().filter(slot => {
      const slotTime = slot.time;
      const lunchEnd = this.lunchBreak.end;
      return slotTime >= lunchEnd; // Tarda: després de l'hora de dinar
    });
  });

  readonly availableServices = computed(() => {
    return this.servicesService.getAllServices();
  });

  readonly canBook = computed(() => {
    return this.selectedService() !== null;
  });

  constructor() {
    this.loadAppointments();
    this.setDefaultClientName();

    // Initialize user effect
    this.#initUserEffect();
  }

  #initUserEffect() {
    effect(() => {
      const user = this.authService.user();
      if (user) {
        this.setDefaultClientName();
      }
    }, { allowSignalWrites: true });
  }

  private loadAppointments() {
    const dades = JSON.parse(localStorage.getItem('cites') || '[]');
    const dadesAmbIds = dades.map((cita: any) => {
      if (!cita.id) {
        return { ...cita, id: uuidv4() };
      }
      return cita;
    });
    this.appointmentsSignal.set(dadesAmbIds);
  }

  private setDefaultClientName() {
    const user = this.authService.user();
    const defaultName = user?.displayName || user?.email || '';
    this.bookingDetailsSignal.update(details => ({ ...details, clientName: defaultName }));
  }

      private generateTimeSlotsForDay(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startHour = parseInt(this.businessHours.start.split(':')[0]);
    const endHour = parseInt(this.businessHours.end.split(':')[0]);
    const lunchStartHour = parseInt(this.lunchBreak.start.split(':')[0]);
    const lunchStartMinute = parseInt(this.lunchBreak.start.split(':')[1]);
    const lunchEndHour = parseInt(this.lunchBreak.end.split(':')[0]);
    const lunchEndMinute = parseInt(this.lunchBreak.end.split(':')[1]);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += this.slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Skip lunch break
        const isLunchBreak = (hour === lunchStartHour && minute >= lunchStartMinute) ||
                            (hour > lunchStartHour && hour < lunchEndHour) ||
                            (hour === lunchEndHour && minute < lunchEndMinute);

        if (isLunchBreak) {
          continue;
        }

        // Check if slot is available
        const available = this.isTimeSlotAvailable(date, time);
        const appointment = this.getAppointmentForTimeSlot(date, time);
        const isPastTime = this.isPastTimeSlot(date, time);

        slots.push({
          time,
          available: available && !isPastTime,
          appointment,
          isLunchBreak: false
        });
      }
    }

    return slots;
  }

  private isPastTimeSlot(date: Date, time: string): boolean {
    if (isSameDay(date, new Date())) {
      const currentTime = new Date();
      const slotTime = new Date(`${format(date, 'yyyy-MM-dd')}T${time}:00`);
      return slotTime <= currentTime;
    }
    return false;
  }

    private isTimeSlotAvailable(date: Date, time: string): boolean {
    const dayAppointments = this.appointments().filter(apt =>
      isSameDay(new Date(apt.data), date)
    );

    // Check if any appointment overlaps with this time slot
    for (const apt of dayAppointments) {
      if (apt.hora === time) {
        return false;
      }
    }

    // Check if the time slot is in the past for today
    if (isSameDay(date, new Date())) {
      const currentTime = new Date();
      const slotTime = new Date(`${format(date, 'yyyy-MM-dd')}T${time}:00`);
      if (slotTime <= currentTime) {
        return false;
      }
    }

    return true;
  }

  private getAppointmentForTimeSlot(date: Date, time: string): any | undefined {
    return this.appointments().find(apt =>
      isSameDay(new Date(apt.data), date) && apt.hora === time
    );
  }

  selectDate(date: Date) {
    this.selectedDateSignal.set(date);
  }

  selectService(service: Service) {
    this.selectedServiceSignal.set(service);
  }

    selectTimeSlot(timeSlot: TimeSlot) {
    if (!timeSlot.available) return;

    const user = this.authService.user();
    const defaultName = user?.displayName || user?.email || '';

    // Crear detalls de reserva amb tota la informació ja seleccionada
    const bookingDetails: BookingDetails = {
      date: format(this.selectedDate(), 'yyyy-MM-dd'),
      time: timeSlot.time,
      clientName: defaultName,
      service: this.selectedService()
    };

    this.bookingDetailsSignal.set(bookingDetails);
    this.showBookingPopupSignal.set(true);
  }

  onBookingConfirmed(details: BookingDetails) {
    const user = this.authService.user();
    if (!user) {
      this.showToast('error', 'Error', 'No s\'ha pogut crear la reserva. Si us plau, inicia sessió.');
      return;
    }

    const nova = {
      nom: details.clientName,
      data: details.date,
      hora: details.time,
      id: uuidv4(),
      userId: user.uid,
      duration: details.service?.duration || 60,
      serviceName: details.service?.name,
      serviceId: details.service?.id
    };

    this.appointmentsSignal.update(appointments => [...appointments, nova]);
    this.guardarCites();
    this.showBookingPopupSignal.set(false);
    this.bookingDetailsSignal.set({date: '', time: '', clientName: ''});

    const serviceInfo = details.service ? ` (${details.service.name} - ${details.service.duration} min)` : '';
    this.showToast('success', '✅ Reserva creada', `S'ha creat una reserva per ${nova.nom} el ${this.formatDate(nova.data)} a les ${nova.hora}${serviceInfo}`, nova.id, true);
  }

  onBookingCancelled() {
    this.showBookingPopupSignal.set(false);
    this.bookingDetailsSignal.set({date: '', time: '', clientName: ''});
  }



  guardarCites() {
    localStorage.setItem('cites', JSON.stringify(this.appointments()));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDay(date: Date): string {
    return format(date, 'EEEE, d MMMM', { locale: ca });
  }

  formatDayShort(date: Date): string {
    return format(date, 'EEE d', { locale: ca });
  }

  isToday(date: Date): boolean {
    return isSameDay(date, new Date());
  }

  isSelected(date: Date): boolean {
    return isSameDay(date, this.selectedDate());
  }

  isBusinessDay(date: Date): boolean {
    return this.businessDays.includes(date.getDay());
  }

  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  }

  canSelectDate(date: Date): boolean {
    return this.isBusinessDay(date) && !this.isPastDate(date);
  }

  previousWeek() {
    this.selectedDateSignal.update(date => addDays(date, -7));
  }

  nextWeek() {
    this.selectedDateSignal.update(date => addDays(date, 7));
  }

  today() {
    this.selectedDateSignal.set(new Date());
  }

  showToast(severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string, appointmentId?: string, showViewButton: boolean = false) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 4000,
      closable: false,
      key: 'booking-mobile-toast',
      data: { appointmentId, showViewButton }
    });
  }

  onToastClick(event: any) {
    const appointmentId = event.message?.data?.appointmentId;
    if (appointmentId) {
      const user = this.authService.user();
      if (!user?.uid) {
        return;
      }

      const clientId = user.uid;
      const uniqueId = `${clientId}-${appointmentId}`;
      this.router.navigate(['/appointments', uniqueId]);
    }
  }

  viewAppointmentDetail(appointmentId: string) {
    const user = this.authService.user();
    if (!user?.uid) {
      return;
    }

    const clientId = user.uid;
    const uniqueId = `${clientId}-${appointmentId}`;
    this.router.navigate(['/appointments', uniqueId]);
  }

  goToDesktopVersion() {
    this.router.navigate(['/booking']);
  }
}
