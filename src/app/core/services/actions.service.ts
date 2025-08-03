import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../shared/services/toast.service';
import { BookingService, Booking } from './booking.service';
import { BookingValidationService } from './booking-validation.service';

export interface ActionConfig {
  id: string;
  label: string;
  icon: string;
  type: 'primary' | 'secondary' | 'danger' | 'success';
  tooltip?: string;
  disabled?: boolean;
  visible?: boolean;
  onClick: (item: any) => void;
}

export interface ActionContext {
  type: 'appointment' | 'service' | 'user' | 'booking';
  item: any;
  permissions?: {
    canEdit?: boolean;
    canDelete?: boolean;
    canView?: boolean;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onTogglePopular?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class ActionsService {
  // Inject services
  #router = inject(Router);
  #translateService = inject(TranslateService);
  #toastService = inject(ToastService);
  #bookingService = inject(BookingService);
  #bookingValidationService = inject(BookingValidationService);

  /**
   * Get available actions for a specific context
   */
  getActions(context: ActionContext): ActionConfig[] {
    const actions: ActionConfig[] = [];

    switch (context.type) {
      case 'appointment':
        actions.push(...this.getAppointmentActions(context));
        break;
      case 'service':
        actions.push(...this.getServiceActions(context));
        break;
      case 'user':
        actions.push(...this.getUserActions(context));
        break;
      case 'booking':
        actions.push(...this.getBookingActions(context));
        break;
    }

    return actions.filter(action => action.visible !== false);
  }

  /**
   * Get appointment-specific actions
   */
  private getAppointmentActions(context: ActionContext): ActionConfig[] {
    const appointment = context.item as Booking;
    const actions: ActionConfig[] = [];

    // View action (only if canView permission is true)
    if (context.permissions?.canView !== false) {
      actions.push({
        id: 'view',
        label: 'COMMON.CLICK_TO_VIEW',
        icon: '👁️',
        type: 'primary',
        tooltip: 'COMMON.CLICK_TO_VIEW',
        onClick: item => this.viewAppointment(item),
      });
    }

    // Edit action (only for future appointments)
    if (this.canEditAppointment(appointment)) {
      actions.push({
        id: 'edit',
        label: 'COMMON.ACTIONS.EDIT',
        icon: '✏️',
        type: 'secondary',
        tooltip: 'COMMON.ACTIONS.EDIT',
        onClick: item => {
          // This will be handled by the context callback if provided
          console.log('Edit appointment:', item);
        },
      });
    }

    // Delete action (only for future appointments)
    if (this.canDeleteAppointment(appointment)) {
      actions.push({
        id: 'delete',
        label: 'COMMON.ACTIONS.DELETE',
        icon: '🗑️',
        type: 'danger',
        tooltip: 'COMMON.DELETE_CONFIRMATION',
        onClick: item => {
          // This will be handled by the context callback if provided
          console.log('Delete appointment:', item);
        },
      });
    }

    return actions;
  }

  /**
   * Get service-specific actions
   */
  private getServiceActions(context: ActionContext): ActionConfig[] {
    const service = context.item;
    const actions: ActionConfig[] = [];

    // Toggle popular action (first, so it appears first)
    actions.push({
      id: 'toggle-popular',
      label: service.popular ? 'ADMIN.SERVICES.UNMARK_POPULAR' : 'ADMIN.SERVICES.MARK_POPULAR',
      icon: service.popular ? '⭐' : '☆',
      type: 'success',
      tooltip: service.popular ? 'ADMIN.SERVICES.UNMARK_POPULAR' : 'ADMIN.SERVICES.MARK_POPULAR',
      onClick: item => {
        // This will be handled by the context callback if provided
        console.log('Toggle popular for service:', item);
      },
    });

    // Edit action
    actions.push({
      id: 'edit',
      label: 'ADMIN.SERVICES.EDIT_SERVICE',
      icon: '✏️',
      type: 'secondary',
      tooltip: 'ADMIN.SERVICES.EDIT_SERVICE',
      onClick: item => {
        // This will be handled by the context callback if provided
        console.log('Edit service:', item);
      },
    });

    // Delete action
    actions.push({
      id: 'delete',
      label: 'COMMON.ACTIONS.DELETE',
      icon: '🗑️',
      type: 'danger',
      tooltip: 'COMMON.ACTIONS.DELETE',
      onClick: item => {
        // This will be handled by the context callback if provided
        console.log('Delete service:', item);
      },
    });

    return actions;
  }

  /**
   * Get user-specific actions
   */
  private getUserActions(context: ActionContext): ActionConfig[] {
    const user = context.item;
    const actions: ActionConfig[] = [];

    // View profile action (only if canView permission is true)
    if (context.permissions?.canView !== false) {
      actions.push({
        id: 'view',
        label: 'COMMON.VIEW_PROFILE',
        icon: '👤',
        type: 'primary',
        tooltip: 'COMMON.VIEW_PROFILE',
        onClick: item => this.viewUserProfile(item),
      });
    }

    // Edit action
    if (context.permissions?.canEdit) {
      actions.push({
        id: 'edit',
        label: 'COMMON.ACTIONS.EDIT',
        icon: '✏️',
        type: 'secondary',
        tooltip: 'COMMON.ACTIONS.EDIT',
        onClick: item => this.editUser(item),
      });
    }

    return actions;
  }

  /**
   * Get booking-specific actions
   */
  private getBookingActions(context: ActionContext): ActionConfig[] {
    const booking = context.item as Booking;
    const actions: ActionConfig[] = [];

    // View action (only if canView permission is true)
    if (context.permissions?.canView !== false) {
      actions.push({
        id: 'view',
        label: 'COMMON.CLICK_TO_VIEW',
        icon: '👁️',
        type: 'primary',
        tooltip: 'COMMON.CLICK_TO_VIEW',
        onClick: item => this.viewBooking(item),
      });
    }

    // Edit action (only for future bookings)
    if (this.canEditBooking(booking)) {
      actions.push({
        id: 'edit',
        label: 'COMMON.ACTIONS.EDIT',
        icon: '✏️',
        type: 'secondary',
        tooltip: 'COMMON.ACTIONS.EDIT',
        onClick: item => this.editBooking(item),
      });
    }

    // Delete action (only for future bookings)
    if (this.canDeleteBooking(booking)) {
      actions.push({
        id: 'delete',
        label: 'COMMON.ACTIONS.DELETE',
        icon: '🗑️',
        type: 'danger',
        tooltip: 'COMMON.DELETE_CONFIRMATION',
        onClick: item => this.deleteBooking(item),
      });
    }

    return actions;
  }

  /**
   * Check if appointment can be edited
   */
  private canEditAppointment(appointment: Booking): boolean {
    if (!appointment?.data || !appointment?.hora) return false;

    const appointmentDate = new Date(`${appointment.data}T${appointment.hora}`);
    const now = new Date();

    return appointmentDate > now;
  }

  /**
   * Check if appointment can be deleted
   */
  private canDeleteAppointment(appointment: Booking): boolean {
    if (!appointment?.data || !appointment?.hora) return false;

    const appointmentDate = new Date(appointment.data);
    return this.#bookingValidationService.canCancelBooking(appointmentDate, appointment.hora);
  }

  /**
   * Check if booking can be edited
   */
  private canEditBooking(booking: Booking): boolean {
    return this.canEditAppointment(booking);
  }

  /**
   * Check if booking can be deleted
   */
  private canDeleteBooking(booking: Booking): boolean {
    return this.canDeleteAppointment(booking);
  }

  // Action handlers for appointments
  private viewAppointment(appointment: Booking): void {
    this.#router.navigate(['/appointments', appointment.id]);
  }

  private editAppointment(appointment: Booking): void {
    this.#router.navigate(['/appointments', appointment.id], {
      queryParams: { edit: 'true' }
    });
  }

  private deleteAppointment(appointment: Booking): void {
    // Show confirmation dialog
    if (confirm(this.#translateService.instant('COMMON.DELETE_CONFIRMATION'))) {
      if (appointment.id) {
        this.#bookingService
          .deleteBooking(appointment.id)
          .then(() => {
            this.#toastService.showSuccess('COMMON.SUCCESS', 'APPOINTMENTS.DELETE_SUCCESS');
          })
          .catch(error => {
            this.#toastService.showError('COMMON.ERROR', 'APPOINTMENTS.DELETE_ERROR');
          });
      }
    }
  }

  // Action handlers for services
  private editService(service: any): void {
    this.#router.navigate(['/admin/services', service.id, 'edit']);
  }

  private toggleServicePopular(service: any): void {
    // Implementation would depend on your service management
    console.log('Toggle popular for service:', service);
  }

  private deleteService(service: any): void {
    if (confirm(this.#translateService.instant('COMMON.DELETE_CONFIRMATION'))) {
      // Implementation would depend on your service management
      console.log('Delete service:', service);
    }
  }

  // Action handlers for users
  private viewUserProfile(user: any): void {
    this.#router.navigate(['/profile', user.uid]);
  }

  private editUser(user: any): void {
    this.#router.navigate(['/profile', user.uid, 'edit']);
  }

  // Action handlers for bookings
  private viewBooking(booking: Booking): void {
    this.viewAppointment(booking); // Same as appointment for now
  }

  private editBooking(booking: Booking): void {
    this.editAppointment(booking); // Same as appointment for now
  }

  private deleteBooking(booking: Booking): void {
    this.deleteAppointment(booking); // Same as appointment for now
  }

  /**
   * Execute an action by ID
   */
  executeAction(actionId: string, context: ActionContext): void {
    const actions = this.getActions(context);
    const action = actions.find(a => a.id === actionId);

    if (action && !action.disabled) {
      // Check if there's a specific callback for this action
      if (actionId === 'edit' && context.onEdit) {
        context.onEdit();
      } else if (actionId === 'delete' && context.onDelete) {
        context.onDelete();
      } else if (actionId === 'view' && context.onView) {
        context.onView();
      } else if (actionId === 'toggle-popular' && context.onTogglePopular) {
        context.onTogglePopular();
      } else {
        // Fallback to the action's onClick method
        action.onClick(context.item);
      }
    }
  }

  /**
   * Get a specific action by ID
   */
  getAction(actionId: string, context: ActionContext): ActionConfig | undefined {
    const actions = this.getActions(context);
    return actions.find(a => a.id === actionId);
  }
}
