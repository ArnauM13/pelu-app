import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface InfoItemData {
  icon: string;
  label: string;
  value: string;
  status?: 'active' | 'inactive' | 'warning' | 'error';
  statusText?: string;
}

@Component({
  selector: 'pelu-info-item',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './info-item.component.html',
  styleUrls: ['./info-item.component.scss']
})
export class InfoItemComponent {
  // Input signals
  readonly data = input.required<InfoItemData>();
  readonly showStatus = input(false);

  // Computed properties
  readonly statusClass = computed(() => {
    const data = this.data();
    const showStatus = this.showStatus();

    if (showStatus && data.status) {
      return `status-${data.status}`;
    }
    return '';
  });

  readonly hasStatus = computed(() => {
    const data = this.data();
    const showStatus = this.showStatus();
    return showStatus && !!data.status;
  });
}
