import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface BusinessInfo {
  businessName: string;
  phone: string;
  address: string;
  specialties: string[];
}

@Component({
  selector: 'pelu-stylist-business-info',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="business-info-card">
      <h2>{{ 'STYLIST.BUSINESS_INFO' | translate }}</h2>
      <div class="info-grid">
        <div class="info-item">
          <label>{{ 'STYLIST.BUSINESS_NAME' | translate }}:</label>
          <span>{{ businessInfo().businessName }}</span>
        </div>
        <div class="info-item">
          <label>{{ 'STYLIST.PHONE' | translate }}:</label>
          <span>{{ businessInfo().phone }}</span>
        </div>
        <div class="info-item">
          <label>{{ 'STYLIST.ADDRESS' | translate }}:</label>
          <span>{{ businessInfo().address }}</span>
        </div>
        @if (businessInfo().specialties.length > 0) {
        <div class="info-item">
          <label>{{ 'STYLIST.SPECIALTIES' | translate }}:</label>
          <div class="specialties">
            @for (specialty of businessInfo().specialties; track specialty) {
            <span class="specialty-tag">{{ specialty }}</span>
            }
          </div>
        </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .business-info-card {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: var(--surface-card);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .business-info-card h2 {
      margin: 0 0 1rem 0;
      color: var(--text-color);
    }

    .info-grid {
      display: grid;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item label {
      font-weight: 600;
      color: var(--text-color);
      font-size: 0.875rem;
    }

    .info-item span {
      color: var(--text-color-secondary);
    }

    .specialties {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .specialty-tag {
      padding: 0.25rem 0.75rem;
      background: var(--primary-color);
      color: var(--primary-color-text);
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 500;
    }
  `]
})
export class StylistBusinessInfoComponent {
  businessInfo = input.required<BusinessInfo>();
}
