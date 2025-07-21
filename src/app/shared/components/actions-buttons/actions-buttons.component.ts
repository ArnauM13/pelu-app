import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { ActionsService, ActionConfig, ActionContext } from '../../../core/services/actions.service';

@Component({
  selector: 'pelu-actions-buttons',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TooltipModule
  ],
  template: `
    <div class="actions-container">
      @for (action of actions; track action.id || action.label) {
                            <button
                      class="btn"
                      [class]="action.type"
                      [disabled]="action.disabled"
                      [pTooltip]="action.tooltip ? (action.tooltip | translate) : (action.label | translate)"
                      pTooltipPosition="left"
                      (click)="onActionClick(action, $event)">
                      {{ action.icon }}
                    </button>
      }
    </div>
  `,
  styles: [`
    .actions-container {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .btn {
      padding: 0.3rem 0.4rem;
      font-size: 0.85rem;
      min-width: 28px;
      min-height: 28px;
      border-radius: 6px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      text-decoration: none;
      gap: 0.25rem;
      box-shadow: var(--box-shadow);
      position: relative;
      overflow: hidden;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: var(--box-shadow-hover);
    }

    .btn:active {
      transform: translateY(0);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn.primary {
      background: var(--gradient-primary);
      color: white;
      border-color: var(--primary-color);
    }

    .btn.primary:hover {
      background: linear-gradient(135deg, var(--primary-color-dark) 0%, var(--primary-color) 100%);
      border-color: var(--primary-color-dark);
    }

    .btn.secondary {
      background: var(--gradient-secondary);
      color: white;
      border-color: var(--secondary-color);
    }

    .btn.secondary:hover {
      background: linear-gradient(135deg, var(--secondary-color-dark) 0%, var(--secondary-color) 100%);
      border-color: var(--secondary-color-dark);
    }

    .btn.danger {
      background: var(--gradient-error);
      color: white;
      border-color: var(--error-color);
    }

    .btn.danger:hover {
      background: linear-gradient(135deg, #B91C1C 0%, var(--error-color) 100%);
      border-color: #B91C1C;
    }

    .btn.success {
      background: var(--gradient-success);
      color: white;
      border-color: var(--success-color);
    }

    .btn.success:hover {
      background: linear-gradient(135deg, var(--success-color-dark) 0%, var(--success-color) 100%);
      border-color: var(--success-color-dark);
    }

    @media (max-width: 768px) {
      .actions-container {
        gap: 0.4rem;
      }

      .btn {
        padding: 0.25rem 0.35rem;
        font-size: 0.8rem;
        min-width: 26px;
        min-height: 26px;
      }
    }
  `]
})
export class ActionsButtonsComponent {
  @Input() context!: ActionContext;

  constructor(private actionsService: ActionsService) {}

  get actions(): ActionConfig[] {
    return this.actionsService.getActions(this.context);
  }

  onActionClick(action: ActionConfig, event: Event): void {
    event.stopPropagation();

    if (!action.disabled) {
      // Execute the action through the service only
      this.actionsService.executeAction(action.id as string, this.context);
    }
  }
}
