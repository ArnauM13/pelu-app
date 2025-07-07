import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { RouterModule } from '@angular/router';

import { AvatarComponent } from '../avatar/avatar.component';
import { InfoItemComponent } from '../info-item/info-item.component';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../auth/auth.service';

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
}

export interface DetailPageConfig {
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
  selector: 'pelu-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ToastModule,
    InputTextModule,
    AvatarComponent,
    InfoItemComponent,
    RouterModule
  ],
  templateUrl: './detail-page.component.html',
  styleUrls: ['./detail-page.component.scss']
})
export class DetailPageComponent implements OnChanges {
  @Input() config!: DetailPageConfig;
  @Output() back = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() updateForm = new EventEmitter<{ field: string; value: any }>();

  constructor(private router: Router, private authService: AuthService, public messageService: MessageService) {}

  ngOnChanges(changes: SimpleChanges) {}

  // Helper getters for template
  get type() { return this.config?.type; }
  get loading() { return this.config?.loading; }
  get notFound() { return this.config?.notFound; }
  get user() { return this.config?.user; }
  get appointment() { return this.config?.appointment; }
  get infoSections() { return this.config?.infoSections || []; }
  get actions() { return this.config?.actions || []; }
  get editForm() { return this.config?.editForm || {}; }
  get isEditing() { return this.config?.isEditing; }
  get hasChanges() { return this.config?.hasChanges; }
  get canSave() { return this.config?.canSave; }

  // Profile specific
  get avatarData() {
    const user = this.user;
    if (!user) return null;
    return {
      name: user.displayName || user.email,
      email: user.email,
      photoURL: user.photoURL
    };
  }
  get displayName() {
    const user = this.user;
    return user?.displayName || user?.email || '';
  }
  get email() {
    const user = this.user;
    return user?.email || '';
  }

  // Appointment specific
  get statusBadge() {
    const appointment = this.appointment;
    if (!appointment) return { text: '', class: '' };
    const today = new Date();
    const appointmentDate = new Date(appointment.data);
    if (appointmentDate.toDateString() === today.toDateString()) {
      return { text: 'COMMON.TODAY', class: 'today' };
    } else if (appointmentDate < today) {
      return { text: 'COMMON.PAST', class: 'past' };
    } else {
      return { text: 'COMMON.UPCOMING', class: 'upcoming' };
    }
  }

  // Not found states
  get notFoundIcon() {
    return this.type === 'profile' ? '🔒' : '❌';
  }
  get notFoundTitle() {
    return this.type === 'profile' ? 'AUTH.NOT_LOGGED_IN' : 'COMMON.ERROR';
  }
  get notFoundMessage() {
    return this.type === 'profile' ? 'AUTH.LOGIN_TO_VIEW_PROFILE' : 'COMMON.NO_DATA';
  }

  // View transitions and toast keys
  get viewTransitionName() { return `${this.type}-container`; }
  get cardTransitionName() { return `${this.type}-card`; }
  get contentTransitionName() { return `${this.type}-content`; }
  get toastKey() { return `${this.type}-detail-toast`; }

  // Event handlers
  onBack() { this.back.emit(); }
  onEdit() { this.edit.emit(); }
  onSave() { this.save.emit(this.editForm); }
  onCancelEdit() { this.cancelEdit.emit(); }
  onDelete() { this.delete.emit(); }
  onUpdateForm(field: string, value: any) { this.updateForm.emit({ field, value }); }

  // Appointment specific methods
  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  formatTime(time: string): string {
    if (!time) return '';
    return time;
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
  // Profile specific methods
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
