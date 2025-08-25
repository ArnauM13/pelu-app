import { Component, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { AppointmentStatusBadgeComponent } from '../../../../shared/components/appointment-status-badge';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { NotFoundStateComponent } from '../../../../shared/components/not-found-state/not-found-state.component';
import { InputCheckboxComponent } from '../../../../shared/components/inputs/input-checkbox/input-checkbox.component';
import { ServiceColorsService } from '../../../../core/services/service-colors.service';
import { ServiceTranslationService } from '../../../../core/services/service-translation.service';
import { ActionsButtonsComponent } from '../../../../shared/components/actions-buttons';
import { ActionsService, ActionContext } from '../../../../core/services/actions.service';
import { ServicesService } from '../../../../core/services/services.service';
import { isFutureAppointment } from '../../../../shared/services';
import { Booking } from '../../../../core/interfaces/booking.interface';

@Component({
  selector: 'pelu-appointments-list',
  imports: [
    CommonModule,
    TranslateModule,
    TooltipModule,
    ButtonModule,
    AppointmentStatusBadgeComponent,
    CardComponent,
    NotFoundStateComponent,
    InputCheckboxComponent,
    ActionsButtonsComponent,
  ],
  template: `
    @if (bookings().length === 0) {
      <div class="full-screen-empty-state">
        <pelu-not-found-state [config]="notFoundConfig" (buttonClick)="clearFilters.emit()">
        </pelu-not-found-state>
      </div>
    } @else {
      <pelu-card>
        <div class="card-header">
          <div class="header-left">
            <h3>
              {{ 'COMMON.APPOINTMENTS_LIST' | translate }}
              <span class="appointments-count">({{ bookings().length }})</span>
            </h3>
            <span class="list-subtitle" style="color:var(--text-color-light); font-size:0.95rem;">{{
                'COMMON.VIEW_APPOINTMENTS_LIST' | translate
              }}</span>
          </div>
          <div class="header-right">
            @if (showSelectButton()) {
              <p-button
                [icon]="internalSelectionMode() ? 'pi pi-times' : 'pi pi-check-square'"
                [label]="internalSelectionMode() ? getTranslation('COMMON.CANCEL_SELECTION') : getTranslation('COMMON.SELECT_APPOINTMENTS')"
                [severity]="internalSelectionMode() ? 'secondary' : 'primary'"
                [outlined]="!internalSelectionMode()"
                [size]="'small'"
                (onClick)="toggleInternalSelectionMode()"
                [disabled]="bookings().length === 0"
              />
            }
          </div>
        </div>

        <!-- Selection Controls (when in selection mode) -->
        @if (internalSelectionMode()) {
          <div class="selection-controls">
            <div class="selection-info">
              <span class="selection-count">
                {{ selectedCount() }} {{ 'COMMON.SELECTED' | translate }}
              </span>
            </div>

            <div class="selection-actions">
              @if (isAllSelected()) {
                <p-button
                  [label]="'❌ ' + getTranslation('COMMON.DESELECT_ALL')"
                  severity="secondary"
                  outlined
                  [size]="'small'"
                  (onClick)="deselectAll()"
                />
              } @else {
                <p-button
                  icon="pi pi-check-square"
                  [label]="getTranslation('COMMON.SELECT_ALL')"
                  severity="secondary"
                  outlined
                  [size]="'small'"
                  (onClick)="selectAll()"
                />
              }

              @if (hasSelection()) {
                <p-button
                  icon="pi pi-download"
                  [label]="getTranslation('COMMON.EXPORT_CSV')"
                  severity="info"
                  [size]="'small'"
                  (onClick)="exportSelectedToCSV()"
                />
                <p-button
                  icon="pi pi-trash"
                  [label]="getTranslation('COMMON.DELETE_SELECTED')"
                  severity="danger"
                  [size]="'small'"
                  (onClick)="bulkDeleteSelected()"
                />
              }
            </div>
          </div>
        }

        <div class="appointments-list">
          @for (booking of bookings(); track booking.id) {
            <div class="appointment-item" [class.selected]="isAppointmentSelected(booking.id || '')" (click)="onAppointmentClick(booking)">
              <!-- Selection Checkbox -->
              @if (effectiveSelectionMode()) {
                <div class="selection-checkbox" (click)="$event.stopPropagation()">
                  <pelu-input-checkbox
                    [value]="isAppointmentSelected(booking.id || '')"
                    [label]="''"
                    [size]="'small'"
                    (valueChange)="onSelectionChange(booking.id || '', $event)"
                  />
                </div>
              }

              <div class="appointment-info">
                <div class="client-info">
                  <div class="client-name-row">
                    <h4 class="client-name">{{ getClientName(booking) }}</h4>
                    <pelu-appointment-status-badge
                      [appointmentData]="{ date: booking.data || '', time: booking.hora || '' }"
                      [config]="{
                        size: 'small',
                        variant: 'default',
                        showIcon: false,
                        showDot: true,
                      }"
                    >
                    </pelu-appointment-status-badge>
                  </div>
                                     <div class="appointment-details">
                     @if (booking.data && booking.hora) {
                       <div class="detail-line date-line">
                         <span class="detail-icon">📅</span>
                         <span class="detail-text">{{ formatDateFull(booking.data || '') }}</span>
                       </div>
                       <div class="detail-line time-line">
                         <span class="detail-icon">🕐</span>
                         <span class="detail-text">{{ formatTime(booking.hora || '') }}</span>
                       </div>
                     } @else if (booking.data) {
                       <div class="detail-line date-line">
                         <span class="detail-icon">📅</span>
                         <span class="detail-text">{{ formatDateFull(booking.data || '') }}</span>
                       </div>
                     } @else {
                       <div class="detail-line date-line">
                         <span class="detail-icon">📅</span>
                         <span class="detail-text">{{ 'COMMON.NO_DATE_SET' | translate }}</span>
                       </div>
                     }
                                           <div class="badges-row">
                        @if (getServiceName(booking)) {
                          <div class="detail-badge service-badge" [style.background-color]="getServiceColor(booking)" [style.color]="getServiceTextColor(booking)" [style.border-color]="getServiceColor(booking)">
                            <span class="detail-icon">{{ getServiceCategoryIcon(booking) }}</span>
                            <span class="detail-text">{{ getServiceName(booking) }}</span>
                          </div>
                        }
                        @if (getServiceDuration(booking)) {
                          <div class="detail-badge duration-badge">
                            <span class="detail-icon">⏱️</span>
                            <span class="detail-text">{{ getServiceDuration(booking) }} min</span>
                          </div>
                        }
                      </div>
                   </div>
                </div>
              </div>
              <div class="appointment-actions-container">
                <pelu-actions-buttons [context]="getActionContext(booking)"> </pelu-actions-buttons>
              </div>
            </div>
          }
        </div>
      </pelu-card>
    }
  `,
  styles: [
    `
      .full-screen-empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--surface-color);
        border-radius: 16px;
        box-shadow: var(--box-shadow);
        border: 1px solid var(--border-color);
      }

      .card-header {
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .card-header h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .header-left {
        flex: 1;
      }

      .header-right {
        display: flex;
        align-items: center;
      }

      // Selection Controls Styles
      .selection-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        margin-bottom: 1rem;
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        box-shadow: var(--box-shadow);
      }

      .selection-info {
        display: flex;
        align-items: center;
      }

      .selection-count {
        font-weight: 600;
        color: var(--primary-color);
        font-size: 0.95rem;
      }

      .selection-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .appointments-count {
        color: var(--primary-color);
        font-weight: 500;
        font-size: 1.2rem;
      }

      .list-subtitle {
        margin: 0;
        color: var(--text-color-secondary);
        font-size: 0.875rem;
      }

      .appointments-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .appointment-item {
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 0.75rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.2s ease;
        gap: 0.75rem;
        min-height: 40px;
        font-size: 0.9rem;
        box-shadow: var(--box-shadow);
        cursor: pointer;
      }

      .appointment-item:hover {
        box-shadow: var(--box-shadow-hover);
        border-color: var(--primary-color-light);
        transform: translateY(-1px);
      }

      .appointment-item.selected {
        border-color: var(--primary-color);
        background: var(--primary-color);
        opacity: 0.9;
      }

      .appointment-item.selected .client-name,
      .appointment-item.selected .detail-text {
        color: white !important;
      }

      .appointment-item.today {
        border-color: var(--primary-color);
        background: var(--secondary-color-light);
      }

      .appointment-item.past {
        opacity: 0.7;
        background: #f8f9fa;
      }

      .selection-checkbox {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        margin-right: 0.5rem;
      }

      .appointment-info {
        flex: 1;
        display: flex;
        align-items: center;
        min-width: 0;
      }

      .client-info {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        min-width: 0;
      }

      .client-name-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.2rem;
      }

      .client-name {
        margin: 0;
        color: var(--text-color);
        font-size: 0.95rem;
        font-weight: 600;
        line-height: 1.1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

             .appointment-details {
         display: flex;
         flex-direction: column;
         gap: 0.3rem;
         font-size: 0.85rem;
       }

       .detail-line {
         display: flex;
         align-items: center;
         gap: 0.5rem;
         color: var(--text-color-secondary);
       }

       .badges-row {
         display: flex;
         flex-direction: row;
         gap: 0.6rem;
         flex-wrap: wrap;
         margin-top: 0.2rem;
       }

                                                                                                                                                                                                                                                               @media (min-width: 768px) {
          .appointment-details {
            display: grid;
            grid-template-columns: auto auto auto auto;
            gap: 1.5rem;
            align-items: center;
            width: 100%;
          }

          .date-line {
            grid-column: 1;
          }

          .time-line {
            grid-column: 2;
          }

          .service-badge {
            grid-column: 3;
            justify-self: start;
            width: fit-content;
          }

          .duration-badge {
            grid-column: 4;
            justify-self: start;
            width: fit-content;
          }

          .badges-row {
            display: contents;
          }

          .detail-line {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

      .detail-badge {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid transparent;
      }

      .detail-icon {
        font-size: 0.85rem;
        width: 14px;
        text-align: center;
      }

      .detail-text {
        font-size: 0.85rem;
        font-weight: 400;
      }

      .time-badge {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color-dark);
      }

      .date-badge {
        background: var(--secondary-color);
        color: white;
        border-color: var(--secondary-color-dark);
      }

      .service-badge {
        background: var(--success-color);
        color: white;
        border-color: var(--success-color-dark);
      }

      .duration-badge {
        background: var(--info-color);
        color: white;
        border-color: var(--info-color-dark);
      }



      .no-date-badge {
        background: var(--text-color-light);
        color: var(--text-color);
        border-color: var(--border-color);
        opacity: 0.7;
      }

      .appointment-actions-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.4rem;
        flex-shrink: 0;
      }

      .appointment-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .btn-primary,
      .btn-secondary,
      .btn-danger {
        padding: 0.3rem 0.4rem;
        font-size: 0.85rem;
        min-width: 28px;
        min-height: 28px;
      }

      .btn-primary {
        background: var(--gradient-primary);
        color: white;
        border-color: var(--primary-color);
      }

      .btn-primary:hover {
        background: linear-gradient(
          135deg,
          var(--primary-color-dark) 0%,
          var(--primary-color) 100%
        );
        border-color: var(--primary-color-dark);
      }

      .btn-secondary {
        background: var(--gradient-secondary);
        color: white;
        border-color: var(--secondary-color);
      }

      .btn-secondary:hover {
        background: linear-gradient(
          135deg,
          var(--secondary-color-dark) 0%,
          var(--secondary-color) 100%
        );
        border-color: var(--secondary-color-dark);
      }

      .btn-danger {
        background: var(--gradient-error);
        color: white;
        border-color: var(--error-color);
      }

      .btn-danger:hover {
        background: linear-gradient(135deg, #b91c1c 0%, var(--error-color) 100%);
        border-color: #b91c1c;
      }

      .btn {
        padding: 0.4rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background: var(--gradient-primary);
        color: white;
      }

      .btn-primary:hover {
        background: linear-gradient(
          135deg,
          var(--primary-color-dark) 0%,
          var(--primary-color) 100%
        );
      }

      .btn-danger {
        background: var(--gradient-error);
        color: white;
      }

      .btn-danger:hover {
        background: linear-gradient(135deg, #b91c1c 0%, var(--error-color) 100%);
      }

      @media (max-width: 768px) {
        .empty-state-content {
          padding: 3rem 1rem;
        }

        .empty-icon {
          font-size: 4rem;
        }

        .empty-state-content h3 {
          font-size: 1.5rem;
        }

        .empty-state-content p {
          font-size: 1rem;
        }

        .appointment-details {
          gap: 0.4rem;
        }

        .detail-badge {
          padding: 0.2rem 0.4rem;
          font-size: 0.75rem;
        }

        .detail-icon {
          font-size: 0.8rem;
          width: 12px;
        }

        .detail-text {
          font-size: 0.75rem;
        }

        .selection-controls {
          flex-direction: column;
          align-items: stretch;
          gap: 1rem;
        }

        .selection-actions {
          justify-content: center;
        }
      }
    `,
  ],
})
export class AppointmentsListComponent {
  bookings = input.required<Booking[]>();
  hasActiveFilters = input.required<boolean>();
  isSelectionMode = input.required<boolean>();
  selectedIds = input.required<Set<string>>();
  isAdmin = input<boolean>(false);

  private readonly serviceTranslationService = inject(ServiceTranslationService);
  private readonly actionsService = inject(ActionsService);
  private readonly serviceColorsService = inject(ServiceColorsService);
  private readonly servicesService = inject(ServicesService);
  private readonly translateService = inject(TranslateService);

  readonly viewBooking = output<Booking>();
  readonly deleteBooking = output<Booking>();
  readonly clearFilters = output<void>();
  readonly toggleSelection = output<string>();
  readonly bulkDelete = output<string[]>();
  readonly exportCSV = output<Booking[]>();

  // Internal selection state
  private readonly internalSelectionStateSignal = signal({
    isSelectionMode: false,
    selectedIds: new Set<string>(),
  });

  // Computed properties for internal selection
  readonly internalSelectionMode = computed(() => this.internalSelectionStateSignal().isSelectionMode);
  readonly internalSelectedIds = computed(() => this.internalSelectionStateSignal().selectedIds);
  readonly selectedCount = computed(() => {
    return this.effectiveSelectionMode()
      ? (this.internalSelectionMode() ? this.internalSelectedIds().size : this.selectedIds().size)
      : 0;
  });
  readonly hasSelection = computed(() => this.selectedCount() > 0);
  readonly isAllSelected = computed(() => {
    const currentAppointments = this.bookings();
    return currentAppointments.length > 0 && this.selectedCount() === currentAppointments.length;
  });

  // Show select button only for admins
  readonly showSelectButton = computed(() => this.isAdmin());

  // Effective selection mode (either external or internal)
  readonly effectiveSelectionMode = computed(() => {
    return this.isSelectionMode() || this.internalSelectionMode();
  });

  readonly isFutureAppointment = isFutureAppointment;

  get notFoundConfig() {
    return {
      icon: '📅',
      title: 'COMMON.NO_APPOINTMENTS',
      message: this.hasActiveFilters()
        ? 'COMMON.NO_APPOINTMENTS_FILTERED'
        : 'COMMON.NO_APPOINTMENTS_SCHEDULED',
      buttonText: this.hasActiveFilters() ? 'COMMON.CLEAR_FILTERS_BUTTON' : undefined,
      showButton: this.hasActiveFilters(),
    };
  }

  isToday(dateString: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  }

  formatTime(timeString: string): string {
    return timeString;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatDateFull(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getTranslatedServiceName(serviceName: string | undefined): string {
    return this.serviceTranslationService.translateServiceName(serviceName || '');
  }

  getClientName(booking: Booking): string {
    return booking.clientName || 'Client';
  }

  getServiceName(booking: Booking): string {
    if (!booking.serviceId) {
      return '';
    }

    try {
      // Get service from Firebase using serviceId
      const allServices = this.servicesService.getAllServices();
      if (!allServices || allServices.length === 0) {
        return '';
      }

      const service = allServices.find(s => s.id === booking.serviceId);
      if (!service) {
        return '';
      }

      return this.servicesService.getServiceName(service);
    } catch (error) {
      console.warn('Error getting service name:', error);
      return '';
    }
  }

  getServiceColor(booking: Booking): string {
    if (!booking.serviceId) {
      return 'var(--success-color)';
    }

    try {
      const allServices = this.servicesService.getAllServices();
      if (!allServices || allServices.length === 0) {
        return 'var(--success-color)';
      }

      const service = allServices.find(s => s.id === booking.serviceId);
      if (!service) {
        return '';
      }

      const serviceColor = this.servicesService.getServiceColor(service);
      return serviceColor.backgroundColor;
    } catch (error) {
      console.warn('Error getting service color:', error);
      return 'var(--success-color)';
    }
  }

  getServiceTextColor(booking: Booking): string {
    if (!booking.serviceId) {
      return 'white';
    }

    try {
      const allServices = this.servicesService.getAllServices();
      if (!allServices || allServices.length === 0) {
        return 'white';
      }

      const service = allServices.find(s => s.id === booking.serviceId);
      if (!service) {
        return 'white';
      }

      const serviceColor = this.servicesService.getServiceColor(service);
      return serviceColor.textColor;
    } catch (error) {
      console.warn('Error getting service text color:', error);
      return 'white';
    }
  }

  getServiceCategoryIcon(booking: Booking): string {
    if (!booking.serviceId) {
      return '✂️';
    }

    try {
      const allServices = this.servicesService.getAllServices();
      if (!allServices || allServices.length === 0) {
        return '✂️';
      }

      const service = allServices.find(s => s.id === booking.serviceId);
      if (!service) {
        return '✂️';
      }

      return this.servicesService.getCategoryIcon(service.category);
    } catch (error) {
      console.warn('Error getting service category icon:', error);
      return '✂️';
    }
  }

  getServiceDuration(booking: Booking): number {
    if (!booking.serviceId) {
      return 60; // Default duration
    }

    try {
      // Get service from Firebase using serviceId
      const allServices = this.servicesService.getAllServices();
      if (!allServices || allServices.length === 0) {
        return 60; // Default duration
      }

      const service = allServices.find(s => s.id === booking.serviceId);
      if (!service) {
        return 60; // Default duration
      }

      return service.duration;
    } catch (error) {
      console.warn('Error getting service duration:', error);
      return 60; // Default duration
    }
  }

  getActionContext(booking: Booking): ActionContext {
    const context: ActionContext = {
      type: 'appointment',
      item: booking,
      onDelete: () => this.deleteBooking.emit(booking),
      onView: () => this.viewBooking.emit(booking),
    };

    return context;
  }

  // Translation helper method
  getTranslation(key: string): string {
    return this.translateService.instant(key);
  }

  // Internal selection methods
  readonly toggleInternalSelectionMode = () => {
    this.internalSelectionStateSignal.update(state => ({
      ...state,
      isSelectionMode: !state.isSelectionMode,
      selectedIds: new Set() // Clear selection when toggling mode
    }));
  };

  readonly selectAll = () => {
    const currentAppointments = this.bookings();
    const allIds = currentAppointments
      .filter(appointment => appointment.id)
      .map(appointment => appointment.id!);

    if (this.internalSelectionMode()) {
      this.internalSelectionStateSignal.update(state => ({
        ...state,
        selectedIds: new Set(allIds)
      }));
    } else {
      // If using external selection, emit all IDs individually
      allIds.forEach(id => this.toggleSelection.emit(id));
    }
  };

  readonly deselectAll = () => {
    if (this.internalSelectionMode()) {
      this.internalSelectionStateSignal.update(state => ({
        ...state,
        selectedIds: new Set()
      }));
    } else {
      // If using external selection, emit all currently selected IDs to deselect them
      Array.from(this.selectedIds()).forEach(id => this.toggleSelection.emit(id));
    }
  };

  readonly bulkDeleteSelected = () => {
    const selectedIdsArray = this.internalSelectionMode()
      ? Array.from(this.internalSelectedIds())
      : Array.from(this.selectedIds());

    if (selectedIdsArray.length === 0) return;

    this.bulkDelete.emit(selectedIdsArray);

    // Clear internal selection after deletion
    if (this.internalSelectionMode()) {
      this.internalSelectionStateSignal.update(state => ({
        ...state,
        selectedIds: new Set(),
        isSelectionMode: false
      }));
    }
  };

  readonly exportSelectedToCSV = () => {
    const selectedIdsArray = this.internalSelectionMode()
      ? Array.from(this.internalSelectedIds())
      : Array.from(this.selectedIds());

    if (selectedIdsArray.length === 0) return;

    // Get the selected bookings
    const selectedBookings = this.bookings().filter(booking =>
      booking.id && selectedIdsArray.includes(booking.id)
    );

    // Emit the export event
    this.exportCSV.emit(selectedBookings);
  };

  // Selection methods
  isAppointmentSelected(appointmentId: string): boolean {
    if (this.internalSelectionMode()) {
      return this.internalSelectedIds().has(appointmentId);
    }
    return this.selectedIds().has(appointmentId);
  }

  onAppointmentClick(booking: Booking): void {
    if (this.effectiveSelectionMode()) {
      // In selection mode, clicking toggles selection
      this.onSelectionChange(booking.id || '', !this.isAppointmentSelected(booking.id || ''));
    } else {
      // Normal mode, view the booking
      this.viewBooking.emit(booking);
    }
  }

  onSelectionChange(appointmentId: string, _checked: boolean): void {
    if (this.internalSelectionMode()) {
      // Handle internal selection
      this.internalSelectionStateSignal.update(state => {
        const newSelectedIds = new Set(state.selectedIds);
        if (newSelectedIds.has(appointmentId)) {
          newSelectedIds.delete(appointmentId);
        } else {
          newSelectedIds.add(appointmentId);
        }
        return {
          ...state,
          selectedIds: newSelectedIds
        };
      });
    } else {
      // Handle external selection
      this.toggleSelection.emit(appointmentId);
    }
  }
}
