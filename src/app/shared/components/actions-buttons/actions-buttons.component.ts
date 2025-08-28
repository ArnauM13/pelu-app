import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import {
  ActionsService,
  ActionConfig,
  ActionContext,
} from '../../../core/services/actions.service';
import { ButtonComponent } from '../buttons/button.component';

@Component({
  selector: 'pelu-actions-buttons',
  imports: [CommonModule, TranslateModule, TooltipModule, ButtonComponent],
  template: `
    <div class="actions-container">
      @for (action of actions; track action.id || action.label) {
        <pelu-button
          [label]="action.label"
          [icon]="action.icon"
          [severity]="getSeverity(action.type)"
          [disabled]="action.disabled || false"
          [ariaLabel]="action.tooltip ? (action.tooltip | translate) : (action.label | translate)"
          [class]="'action-button'"
          (clicked)="onActionClick(action, $event)"
        />
      }
    </div>
  `,
  styles: [
    `
      .actions-container {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .action-button {
        min-width: 28px;
        min-height: 28px;
      }

      @media (max-width: 768px) {
        .actions-container {
          gap: 0.4rem;
        }

        .action-button {
          min-width: 26px;
          min-height: 26px;
        }
      }
    `,
  ],
})
export class ActionsButtonsComponent {
  @Input() context!: ActionContext;

  private readonly actionsService = inject(ActionsService);

  get actions(): ActionConfig[] {
    return this.actionsService.getActions(this.context);
  }

  getSeverity(type: 'primary' | 'secondary' | 'danger' | 'success'): 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast' {
    switch (type) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'danger':
        return 'danger';
      case 'success':
        return 'success';
      default:
        return 'primary';
    }
  }

  onActionClick(action: ActionConfig, event: Event): void {
    event.stopPropagation();

    if (!action.disabled) {
      // Execute the action through the service only
      this.actionsService.executeAction(action.id as string, this.context);
    }
  }
}
