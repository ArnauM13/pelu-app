import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BookingService } from '../../../core/services/booking.service';
import { RoleService } from '../../../core/services/role.service';
import { UserService } from '../../../core/services/user.service';
import { FirebaseServicesService } from '../../../core/services/firebase-services.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'pelu-next-appointment-chip',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './next-appointment-chip.component.html',
  styleUrls: ['./next-appointment-chip.component.scss'],
})
export class NextAppointmentChipComponent {
  private readonly bookingService = inject(BookingService);
  private readonly roleService = inject(RoleService);
  private readonly userService = inject(UserService);
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly isPopupOpen = signal(false);

  readonly nextBooking = computed(() => {
    const email = this.userService.userEmail();
    if (!email) return null;
    const now = new Date();
    return this.bookingService.bookings()
      .filter(b => {
        if (b.status !== 'confirmed' || !b.data) return false;
        if (b.email !== email) return false;
        const [h, m] = (b.hora || '23:59').split(':').map(Number);
        const dt = new Date(b.data);
        dt.setHours(h, m, 0, 0);
        return dt > now;
      })
      .sort((a, b) => {
        const da = new Date(`${a.data}T${a.hora}`).getTime();
        const db = new Date(`${b.data}T${b.hora}`).getTime();
        return da - db;
      })[0] ?? null;
  });

  readonly serviceName = computed(() => {
    const booking = this.nextBooking();
    if (!booking) return '';
    const service = this.firebaseServicesService.services()
      .find(s => s.id === booking.serviceId);
    return service?.name ?? '';
  });

  readonly isVisible = computed(
    () => this.roleService.isClient() && !!this.nextBooking()
  );

  readonly chipLabel = computed(() => {
    const b = this.nextBooking();
    if (!b) return '';
    return `${this.formatChipDate(b.data)} · ${b.hora}`;
  });

  togglePopup() {
    this.isPopupOpen.update(v => !v);
  }

  closePopup() {
    this.isPopupOpen.set(false);
  }

  viewDetails() {
    const b = this.nextBooking();
    if (b?.id) {
      this.router.navigate(['/appointments', b.id]);
    }
    this.closePopup();
  }

  formatChipDate(dateStr: string): string {
    if (!dateStr) return '';
    // dateStr is YYYY-MM-DD; parse as local date to avoid timezone shift
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const lang = this.translate.currentLang || 'ca';
    const weekday = date.toLocaleDateString(lang, { weekday: 'short' });
    const day = d;
    const month = date.toLocaleDateString(lang, { month: 'short' });
    return `${weekday} ${day} ${month}`;
  }

  formatFullDate(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const lang = this.translate.currentLang || 'ca';
    return date.toLocaleDateString(lang, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }
}
