import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../core/services/user.service';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../shared/services/toast.service';
import { LoaderService } from '../../../shared/services/loader.service';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';
import { PeluTitleComponent } from '../../../shared/components/pelu-title/pelu-title.component';
import { ConfirmationPopupComponent, type ConfirmationData } from '../../../shared/components/confirmation-popup/confirmation-popup.component';
import { InputTextComponent } from '../../../shared/components/inputs/input-text/input-text.component';
import { UserRole } from '../../../core/services/role.service';
import { Booking } from '../../../core/interfaces/booking.interface';

interface ClientSummary extends UserRole {
  bookingCount: number;
  nextBooking?: Booking;
}

@Component({
  selector: 'pelu-admin-clients-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonComponent,
    PeluTitleComponent,
    ConfirmationPopupComponent,
    InputTextComponent,
  ],
  templateUrl: './admin-clients-page.component.html',
  styleUrls: ['./admin-clients-page.component.scss'],
})
export class AdminClientsPageComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly bookingService = inject(BookingService);
  private readonly toastService = inject(ToastService);
  private readonly loaderService = inject(LoaderService);

  readonly clients = signal<ClientSummary[]>([]);
  readonly selectedClient = signal<ClientSummary | null>(null);
  readonly searchQuery = signal('');
  readonly isEditing = signal(false);
  readonly isSaving = signal(false);

  // Edit form state
  readonly editName = signal('');
  readonly editPhone = signal('');

  // Confirmation
  isConfirmOpen = false;
  confirmData: ConfirmationData | null = null;
  private clientToDelete: ClientSummary | null = null;
  private clientToToggleRole: ClientSummary | null = null;

  readonly filteredClients = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.clients();
    if (!q) return all;
    return all.filter(c =>
      (c.displayName || '').toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  readonly selectedClientBookings = computed(() => {
    const client = this.selectedClient();
    if (!client) return [];
    return this.bookingService.bookings()
      .filter(b => b.uid === client.uid || b.email === client.email)
      .sort((a, b) => {
        const da = new Date(`${a.data}T${a.hora}`).getTime();
        const db = new Date(`${b.data}T${b.hora}`).getTime();
        return db - da;
      })
      .slice(0, 5);
  });

  async ngOnInit() {
    await this.loadClients();
  }

  private async loadClients() {
    this.loaderService.show({ message: 'ADMIN.CLIENTS.LOADING' });
    try {
      const users = await this.userService.listAllUsers();
      const bookings = this.bookingService.bookings();
      const today = new Date().toISOString().split('T')[0];

      const clientsWithData: ClientSummary[] = users.map(user => {
        const userBookings = bookings.filter(
          b => b.uid === user.uid || b.email === user.email
        );
        const nextBooking = userBookings
          .filter(b => b.data >= today && b.status !== 'cancelled')
          .sort((a, b) => a.data.localeCompare(b.data))[0];

        return {
          ...user,
          bookingCount: userBookings.length,
          nextBooking,
        };
      });

      clientsWithData.sort((a, b) => {
        if (a.role !== b.role) return a.role === 'admin' ? -1 : 1;
        return (a.displayName || a.email).localeCompare(b.displayName || b.email);
      });

      this.clients.set(clientsWithData);
    } finally {
      this.loaderService.hide();
    }
  }

  selectClient(client: ClientSummary) {
    this.selectedClient.set(client);
    this.editName.set(client.displayName || '');
    this.editPhone.set(client.phone || '');
    this.isEditing.set(false);
  }

  backToList() {
    this.selectedClient.set(null);
    this.isEditing.set(false);
  }

  startEdit() {
    this.isEditing.set(true);
  }

  cancelEdit() {
    const client = this.selectedClient();
    if (client) {
      this.editName.set(client.displayName || '');
      this.editPhone.set(client.phone || '');
    }
    this.isEditing.set(false);
  }

  async saveEdit() {
    const client = this.selectedClient();
    if (!client) return;

    this.isSaving.set(true);
    try {
      const updates: Partial<UserRole> = {
        displayName: this.editName().trim() || undefined,
        phone: this.editPhone().trim() || undefined,
      };
      await this.userService.updateUserRole(client.uid, updates);

      const updated: ClientSummary = {
        ...client,
        displayName: this.editName().trim() || undefined,
        phone: this.editPhone().trim() || undefined,
      };
      this.selectedClient.set(updated);
      this.clients.update(list =>
        list.map(c => c.uid === client.uid ? updated : c)
      );
      this.isEditing.set(false);
      this.toastService.showSuccess('COMMON.STATUS.STATUS_SUCCESS', 'ADMIN.CLIENTS.SAVE_SUCCESS');
    } catch {
      this.toastService.showError('COMMON.ERROR', 'ADMIN.CLIENTS.SAVE_ERROR');
    } finally {
      this.isSaving.set(false);
    }
  }

  confirmToggleRole(client: ClientSummary) {
    this.clientToToggleRole = client;
    const isPromoting = client.role === 'client';
    this.confirmData = {
      title: isPromoting ? 'ADMIN.CLIENTS.PROMOTE_CONFIRM_TITLE' : 'ADMIN.CLIENTS.DEMOTE_CONFIRM_TITLE',
      message: isPromoting ? 'ADMIN.CLIENTS.PROMOTE_CONFIRM_MSG' : 'ADMIN.CLIENTS.DEMOTE_CONFIRM_MSG',
      severity: isPromoting ? 'warning' : 'danger',
      userName: client.displayName || client.email,
    };
    this.isConfirmOpen = true;
  }

  confirmDeleteClient(client: ClientSummary) {
    this.clientToDelete = client;
    this.clientToToggleRole = null;
    this.confirmData = {
      title: 'ADMIN.CLIENTS.DELETE_CONFIRM_TITLE',
      message: 'ADMIN.CLIENTS.DELETE_CONFIRM_MSG',
      severity: 'danger',
      userName: client.displayName || client.email,
    };
    this.isConfirmOpen = true;
  }

  async onConfirm() {
    this.isConfirmOpen = false;
    if (this.clientToToggleRole) {
      await this.executeToggleRole(this.clientToToggleRole);
      this.clientToToggleRole = null;
    } else if (this.clientToDelete) {
      await this.executeDeleteClient(this.clientToDelete);
      this.clientToDelete = null;
    }
  }

  onCancel() {
    this.isConfirmOpen = false;
    this.clientToDelete = null;
    this.clientToToggleRole = null;
  }

  private async executeToggleRole(client: ClientSummary) {
    const newRole = client.role === 'admin' ? 'client' : 'admin';
    this.loaderService.show();
    try {
      await this.userService.updateUserRole(client.uid, { role: newRole });
      const updated: ClientSummary = { ...client, role: newRole };
      this.clients.update(list =>
        list.map(c => c.uid === client.uid ? updated : c)
      );
      if (this.selectedClient()?.uid === client.uid) {
        this.selectedClient.set(updated);
      }
      this.toastService.showSuccess('COMMON.STATUS.STATUS_SUCCESS', 'ADMIN.CLIENTS.ROLE_UPDATED');
    } catch {
      this.toastService.showError('COMMON.ERROR', 'ADMIN.CLIENTS.SAVE_ERROR');
    } finally {
      this.loaderService.hide();
    }
  }

  private async executeDeleteClient(client: ClientSummary) {
    this.loaderService.show();
    try {
      await this.userService.deleteUser(client.uid);
      this.clients.update(list => list.filter(c => c.uid !== client.uid));
      if (this.selectedClient()?.uid === client.uid) {
        this.selectedClient.set(null);
      }
      this.toastService.showSuccess('COMMON.STATUS.STATUS_SUCCESS', 'ADMIN.CLIENTS.DELETE_SUCCESS');
    } catch {
      this.toastService.showError('COMMON.ERROR', 'ADMIN.CLIENTS.DELETE_ERROR');
    } finally {
      this.loaderService.hide();
    }
  }

  getInitials(client: ClientSummary): string {
    const name = client.displayName || client.email;
    return name.slice(0, 2).toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
}
