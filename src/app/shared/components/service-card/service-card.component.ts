import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { FirebaseService } from '../../../core/services/firebase-services.service';
import { CurrencyPipe } from '../../pipes/currency.pipe';
import { ActionsButtonsComponent } from '../actions-buttons';
import { PopularBadgeComponent } from '../popular-badge/popular-badge.component';
import { ActionsService, ActionContext } from '../../../core/services/actions.service';

export interface ServiceCardConfig {
  showActions?: boolean;
  showPopularBadge?: boolean;
  showCategory?: boolean;
  showDuration?: boolean;
  showPrice?: boolean;
  showDescription?: boolean;
  clickable?: boolean;
  selected?: boolean;
  compact?: boolean;
}

@Component({
  selector: 'pelu-service-card',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TooltipModule,
    CurrencyPipe,
    ActionsButtonsComponent,
    PopularBadgeComponent
  ],
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss']
})
export class ServiceCardComponent {
  @Input() service!: FirebaseService;
  @Input() config: ServiceCardConfig = {
    showActions: false,
    showPopularBadge: true,
    showCategory: true,
    showDuration: true,
    showPrice: true,
    showDescription: true,
    clickable: false,
    selected: false,
    compact: false
  };

  @Output() cardClick = new EventEmitter<FirebaseService>();
  @Output() editClick = new EventEmitter<FirebaseService>();
  @Output() deleteClick = new EventEmitter<FirebaseService>();
  @Output() togglePopularClick = new EventEmitter<FirebaseService>();

  constructor(private actionsService: ActionsService) {}

  readonly isClickable = computed(() => this.config.clickable);
  readonly isSelected = computed(() => this.config.selected);
  readonly isCompact = computed(() => this.config.compact);

  onCardClick(): void {
    if (this.config.clickable) {
      this.cardClick.emit(this.service);
    }
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.editClick.emit(this.service);
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.deleteClick.emit(this.service);
  }

  onTogglePopularClick(event: Event): void {
    event.stopPropagation();
    this.togglePopularClick.emit(this.service);
  }

  getCategoryName(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'haircut': 'SERVICES.CATEGORIES.HAIRCUT',
      'beard': 'SERVICES.CATEGORIES.BEARD',
      'treatment': 'SERVICES.CATEGORIES.TREATMENT',
      'styling': 'SERVICES.CATEGORIES.STYLING',
      'coloring': 'SERVICES.CATEGORIES.COLORING',
      'children': 'SERVICES.CATEGORIES.CHILDREN',
      'special': 'SERVICES.CATEGORIES.SPECIAL',
      'general': 'SERVICES.CATEGORIES.GENERAL'
    };
    return categoryMap[category] || category;
  }

  get actionContext(): ActionContext {
    return {
      type: 'service',
      item: this.service,
      onEdit: () => this.editClick.emit(this.service),
      onDelete: () => this.deleteClick.emit(this.service),
      onTogglePopular: () => this.togglePopularClick.emit(this.service)
    };
  }
}
