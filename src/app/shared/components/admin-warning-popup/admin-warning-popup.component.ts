import { Component, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PopupDialogComponent, PopupDialogConfig } from '../popup-dialog/popup-dialog.component';

@Component({
  selector: 'pelu-admin-warning-popup',
  imports: [
    CommonModule,
    TranslateModule,
    PopupDialogComponent,
  ],
  templateUrl: './admin-warning-popup.component.html',
  styleUrls: ['./admin-warning-popup.component.scss'],
})
export class AdminWarningPopupComponent {
  private readonly translateService = inject(TranslateService);

  // Input signals
  readonly isOpen = input<boolean>(false);
  readonly bookingOwnerName = input<string>('');

  // Output signals
  readonly closed = output<void>();

  // Computed properties
  readonly dialogConfig = computed<PopupDialogConfig>(() => ({
    title: this.translateService.instant('COMMON.ADMIN_WARNING_TITLE'),
    size: 'small',
    closeOnBackdropClick: true,
    showFooter: false,
    footerActions: [],
    customClass: 'admin-warning-popup',
  }));

  onClose(): void {
    this.closed.emit();
  }
}
