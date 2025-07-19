import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { RouterModule } from '@angular/router';

import { AvatarComponent } from '../avatar/avatar.component';
import { InfoItemComponent } from '../info-item/info-item.component';
import { AppointmentStatusBadgeComponent } from '../appointment-status-badge';
import { NotFoundStateComponent } from '../not-found-state/not-found-state.component';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { ToastService } from '../../services/toast.service';
import { LoaderService } from '../../services/loader.service';

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
  items: any[];
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export interface DetailViewConfig {
  type: 'profile' | 'appointment';
  loading: boolean;
  notFound: boolean;
  user?: any;
  appointment?: any;
  infoSections: InfoSection[];
  actions: DetailAction[];
  editForm?: any;
  isEditing?: boolean;
  hasChanges?: boolean;
  canSave?: boolean;
}

@Component({
  selector: 'pelu-detail-view',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    InputTextModule,
    AvatarComponent,
    InfoItemComponent,
    AppointmentStatusBadgeComponent,
    NotFoundStateComponent,
    RouterModule
  ],
  templateUrl: './detail-view.component.html',
  styleUrls: ['./detail-view.component.scss']
})
export class DetailViewComponent implements OnChanges {
  @Input() config!: DetailViewConfig;
  @Output() back = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() updateForm = new EventEmitter<{ field: string; value: any }>();

    constructor(
    private router: Router,
    private serviceColorsService: ServiceColorsService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    // Handle loading state with global loader service
    if (changes['config']) {
      if (this.config?.loading) {
        this.loaderService.show();
      } else {
        this.loaderService.hide();
      }
    }
  }

  // Helper getters for template
  get type() { return this.config?.type; }
  get loading() { return this.config?.loading; }
  get notFound() { return this.config?.notFound; }
  get user() { return this.config?.user; }
  get appointment() { return this.config?.appointment; }
  get infoSections() { return this.config?.infoSections || []; }
  get actions() { return this.config?.actions || []; }
  get filteredActions() {
    return this.actions.filter(action =>
      action.label !== 'COMMON.ACTIONS.BACK' &&
      action.label !== 'Back' &&
      action.label !== 'Tornar endarrere'
    );
  }

  get hasAvailableActions() {
    return this.filteredActions.length > 0;
  }
  get editForm() { return this.config?.editForm || {}; }
  get isEditing() { return this.config?.isEditing; }
  get hasChanges() { return this.config?.hasChanges; }
  get canSave() { return this.config?.canSave; }

  // Profile specific
  get avatarData() {
    const user = this.user;
    if (!user) return null;

    // Parse displayName to separate name and surname
    const displayName = user.displayName || '';
    const nameParts = displayName.split(' ');
    const name = nameParts[0] || '';
    const surname = nameParts.slice(1).join(' ') || '';

    return {
      name: name,
      surname: surname,
      email: user.email,
      imageUrl: user.photoURL
    };
  }

  get displayName() {
    const user = this.user;
    return user?.displayName || user?.email?.split('@')[0] || 'COMMON.USER';
  }

  get email() {
    return this.user?.email || 'COMMON.NOT_AVAILABLE';
  }

  // Appointment specific
  get statusBadge() {
    const appointment = this.appointment;
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
  }

  // Not found states
  get notFoundConfig() {
    return {
      icon: this.type === 'profile' ? '👤' : '📅',
      title: this.type === 'profile' ? 'PROFILE.NOT_FOUND' : 'APPOINTMENTS.NOT_FOUND',
      message: this.type === 'profile' ? 'AUTH.LOGIN_TO_VIEW_PROFILE' : 'COMMON.NO_DATA',
      buttonText: 'COMMON.ACTIONS.BACK',
      showButton: true
    };
  }

  // View transitions and toast keys
  get viewTransitionName() { return `${this.type}-container`; }
  get cardTransitionName() { return `${this.type}-card`; }
  get contentTransitionName() { return `${this.type}-content`; }
  get toastKey() { return `${this.type}-detail-toast`; }

    // Service color gradient for appointment detail page
  get serviceGradient(): string {
    if (this.type !== 'appointment' || !this.appointment) {
      return 'linear-gradient(135deg, var(--background-color) 0%, var(--secondary-color-light) 100%)';
    }

    const serviceName = this.appointment.serviceName || this.appointment.servei || '';
    const serviceColor = this.serviceColorsService.getServiceColor(serviceName);

    // Create gradient from white to service color
    return `linear-gradient(135deg, #ffffff 0%, ${serviceColor.backgroundColor} 100%)`;
  }

  // Service color gradient for appointment header
  getAppointmentHeaderGradient(): string {
    if (this.type !== 'appointment' || !this.appointment) {
      return 'var(--gradient-header-detail)';
    }

    const serviceName = this.appointment.serviceName || this.appointment.servei || '';
    const serviceColor = this.serviceColorsService.getServiceColor(serviceName);

    // Create gradient from white to service color with more opacity
    return `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, ${serviceColor.backgroundColor} 100%)`;
  }

  // Event handlers
  onBack() { this.back.emit(); }
  onEdit() { this.edit.emit(); }
  onSave() { this.save.emit(this.editForm); }
  onCancelEdit() { this.cancelEdit.emit(); }
  onDelete() { this.delete.emit(); }
  onUpdateForm(field: string, value: any) { this.updateForm.emit({ field, value }); }

  // Notes editing methods
  private editingNotes: any[] = [];

  onUpdateNote(index: number, value: string) {
    this.editingNotes[index] = value;
  }

  onSaveNotes(section: InfoSection) {
    if (section.onSave) {
      const updatedNotes = section.items.map((item, index) => ({
        ...item,
        value: this.editingNotes[index] || item.value
      }));
      section.onSave({ notes: updatedNotes });
      this.editingNotes = [];
    }
  }

  // Utility methods
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    return timeString;
  }

  // Toast methods
  onToastClick(event: any) {
    if (event.data?.showViewButton && event.data?.appointmentId) {
      this.viewAppointmentDetail(event.data.appointmentId);
    }
  }

  viewAppointmentDetail(appointmentId: string) {
    this.router.navigate(['/appointments', appointmentId]);
  }
}
