import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { PopupDialogComponent, PopupDialogConfig } from '../popup-dialog/popup-dialog.component';
import { ConfirmationPopupComponent, ConfirmationData } from '../confirmation-popup/confirmation-popup.component';
import { AlertPopupComponent, AlertData } from '../alert-popup/alert-popup.component';
import { PopupModalComponent } from '../popup-modal/popup-modal.component';

@Component({
  selector: 'pelu-dialogs-demo',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    PopupDialogComponent,
    ConfirmationPopupComponent,
    AlertPopupComponent,
    PopupModalComponent,
  ],
  templateUrl: './dialogs-demo.component.html',
  styleUrls: ['./dialogs-demo.component.scss'],
})
export class DialogsDemoComponent {
  // Basic dialog
  readonly isBasicDialogOpen = signal(false);
  readonly basicDialogConfig = signal<PopupDialogConfig>({
    title: 'Diàleg bàsic',
    size: 'medium',
    closeOnBackdropClick: true,
    showFooter: true,
    footerActions: [
      { label: 'Tancar', type: 'close', action: () => this.closeBasicDialog() },
      { label: 'Confirmar', type: 'confirm', action: () => this.closeBasicDialog() },
    ],
  });

  openBasicDialog() { this.isBasicDialogOpen.set(true); }
  closeBasicDialog() { this.isBasicDialogOpen.set(false); }

  // Confirmation popup
  readonly isConfirmOpen = signal(false);
  readonly confirmData = signal<ConfirmationData>({
    title: 'Confirmació',
    message: 'Vols continuar amb aquesta acció?',
    confirmText: 'Confirmar',
    cancelText: 'Cancel·lar',
    severity: 'warning',
  });
  openConfirm() { this.isConfirmOpen.set(true); }
  onConfirm() { this.isConfirmOpen.set(false); }
  onCancelConfirm() { this.isConfirmOpen.set(false); }

  // Alert popup
  readonly isAlertOpen = signal(false);
  readonly alertData = signal<AlertData>({
    title: 'Informació',
    message: 'Operació completada correctament.',
    emoji: 'ℹ️',
    confirmText: 'D\'acord',
    severity: 'success',
  });
  openAlert() { this.isAlertOpen.set(true); }
  onAlertClose() { this.isAlertOpen.set(false); }

  // Simple modal (backdrop + content)
  readonly isModalOpen = signal(false);
  openModal() { this.isModalOpen.set(true); }
  closeModal() { this.isModalOpen.set(false); }
}


