import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { FirebaseService } from '../../../core/services/firebase-services.service';
import { ActionsButtonsComponent } from '../actions-buttons';
import { PopularBadgeComponent } from '../popular-badge/popular-badge.component';
import { ActionContext } from '../../../core/services/actions.service';

@Component({
  selector: 'pelu-service-card',
  imports: [
    CommonModule,
    TranslateModule,
    TooltipModule,
    ActionsButtonsComponent,
    PopularBadgeComponent,
  ],
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss'],
})
export class ServiceCardComponent {
  // Input signals with default values
  readonly service = input.required<FirebaseService>();

  // Display options
  readonly showActions = input<boolean>(false);
  readonly showPopularBadge = input<boolean>(true);
  readonly showCategory = input<boolean>(true);
  readonly showDuration = input<boolean>(true);
  readonly showPrice = input<boolean>(true);
  readonly showDescription = input<boolean>(true);

  // Interaction options
  readonly clickable = input<boolean>(false);
  readonly selected = input<boolean>(false);
  readonly compact = input<boolean>(false);
  readonly simpleMode = input<boolean>(false);

  // Output signals
  readonly cardClick = output<FirebaseService>();
  readonly editClick = output<FirebaseService>();
  readonly deleteClick = output<FirebaseService>();
  readonly togglePopularClick = output<FirebaseService>();

  // Computed signals for reactive template
  readonly isClickable = computed(() => this.clickable());
  readonly isSelected = computed(() => this.selected());
  readonly isCompact = computed(() => this.compact());
  readonly isSimpleMode = computed(() => this.simpleMode());

  // Event handlers
  onCardClick(): void {
    if (this.clickable()) {
      this.cardClick.emit(this.service());
    }
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.editClick.emit(this.service());
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.deleteClick.emit(this.service());
  }

  onTogglePopularClick(event: Event): void {
    event.stopPropagation();
    this.togglePopularClick.emit(this.service());
  }

  // Simple mode state management
  private expanded = false;

  toggleExpanded(event: Event): void {
    event.stopPropagation();
    this.expanded = !this.expanded;
  }

  get isExpanded(): boolean {
    return this.expanded;
  }

  getCategoryName(category: string): string {
    const categoryMap: { [key: string]: string } = {
      haircut: 'SERVICES.CATEGORIES.HAIRCUT',
      beard: 'SERVICES.CATEGORIES.BEARD',
      treatment: 'SERVICES.CATEGORIES.TREATMENT',
      styling: 'SERVICES.CATEGORIES.STYLING',
      coloring: 'SERVICES.CATEGORIES.COLORING',
      children: 'SERVICES.CATEGORIES.CHILDREN',
      special: 'SERVICES.CATEGORIES.SPECIAL',
      general: 'SERVICES.CATEGORIES.GENERAL',
    };
    return categoryMap[category] || category;
  }

  get actionContext(): ActionContext {
    return {
      type: 'service',
      item: this.service(),
      onEdit: () => this.editClick.emit(this.service()),
      onDelete: () => this.deleteClick.emit(this.service()),
      onTogglePopular: () => this.togglePopularClick.emit(this.service()),
    };
  }
}
