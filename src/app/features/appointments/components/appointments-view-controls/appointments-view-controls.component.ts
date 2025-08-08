import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FloatingButtonComponent } from '../../../../shared/components/floating-button/floating-button.component';

export interface ViewButton {
  icon: string;
  tooltip: string;
  ariaLabel: string;
  isActive: boolean;
  variant: 'primary' | 'secondary';
  size: 'small' | 'medium' | 'large';
}

@Component({
  selector: 'pelu-appointments-view-controls',
  imports: [CommonModule, TranslateModule, FloatingButtonComponent],
  template: `
    <div class="view-toggle-fab" role="group" [attr.aria-label]="'COMMON.CHANGE_VIEW' | translate">
      @for (button of viewButtons(); track button.icon; let i = $index) {
        <pelu-floating-button
          [config]="button"
          (clicked)="viewModeChange.emit(i === 0 ? 'list' : 'calendar')"
        >
        </pelu-floating-button>
      }
    </div>
  `,
  styles: [
    `
      .view-toggle-fab {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 1000;
      }

      /* Hide view toggle buttons on mobile */
      @media (max-width: 768px) {
        .view-toggle-fab {
          display: none;
        }
      }
    `,
  ],
})
export class AppointmentsViewControlsComponent {
  viewButtons = input.required<ViewButton[]>();

  viewModeChange = output<'list' | 'calendar'>();
}
