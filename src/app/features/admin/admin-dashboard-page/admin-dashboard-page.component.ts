import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';
import { ConfirmationPopupComponent, type ConfirmationData } from '../../../shared/components/confirmation-popup/confirmation-popup.component';
import { PeluTitleComponent } from '../../../shared/components/pelu-title/pelu-title.component';
import { UserService } from '../../../core/services/user.service';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'pelu-admin-dashboard-page',
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ButtonComponent,
    ConfirmationPopupComponent,
    PeluTitleComponent,
  ],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrls: ['./admin-dashboard-page.component.scss'],
})
export class AdminDashboardPageComponent {
  userService = inject(UserService);
  #bookingService = inject(BookingService);
  #toast = inject(ToastService);

  // Computed properties per a la UI (unified from both services)
  readonly isAdmin = computed(() => this.userService.isAdmin());
  readonly canManageUsers = computed(() => this.userService.canManageUsers());
  readonly canViewAllAppointments = computed(() => this.userService.canViewAllAppointments());

  // Confirmation state
  isConfirmOpen = false;
  confirmData: ConfirmationData | null = null;

  async deleteAllBookings(): Promise<void> {
    if (!this.isAdmin()) return;
    this.confirmData = {
      title: '',
      message: 'ADMIN.CONFIRM_DELETE_ALL_BOOKINGS',
      severity: 'danger',
    };
    this.isConfirmOpen = true;
  }

  onConfirmDeleteAll() {
    this.isConfirmOpen = false;
    this.#bookingService.deleteAllBookings().then(count => {
      if (count > 0) {
        this.#toast.showSuccess('ADMIN.BOOKINGS_DELETED_SUCCESS');
      } else {
        this.#toast.showWarning('ADMIN.NO_BOOKINGS_DELETED');
      }
    });
  }

  onCancelDeleteAll() {
    this.isConfirmOpen = false;
  }
}
