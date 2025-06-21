import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './info-item.component.html',
  styleUrls: ['./info-item.component.scss']
})
export class InfoItemComponent {
  @Input() data!: InfoItemData;
  @Input() showStatus: boolean = false;

  getStatusClass(): string {
    if (this.showStatus && this.data.status) {
      return `status-${this.data.status}`;
    }
    return '';
  }
}
