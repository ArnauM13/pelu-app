import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'pelu-advanced-filters-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="advanced-filters-popup">
      <div class="filters-grid">
        <div class="filter-group">
          <label for="filterDate">Filtrar per data:</label>
          <input
            type="date"
            id="filterDate"
            [(ngModel)]="filterDate"
            (ngModelChange)="onDateChangeHandler($event)"
            class="input">
        </div>
        <div class="filter-group">
          <label for="filterClient">Filtrar per client:</label>
          <input
            type="text"
            id="filterClient"
            [(ngModel)]="filterClient"
            (ngModelChange)="onClientChangeHandler($event)"
            placeholder="Buscar per nom..."
            class="input">
        </div>
      </div>
      <div class="reset-section">
        <button class="reset-btn" (click)="onResetHandler()">
          🗑️ Netejar filtres
        </button>
      </div>
    </div>
  `,
  styles: [`
    .advanced-filters-popup {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .filters-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 600;
      color: #1f2937;
      font-size: 0.9rem;
    }

    .input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      background-color: white;
      color: #1f2937;
    }

    .input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .reset-section {
      display: flex;
      justify-content: center;
    }

    .reset-btn {
      background: #ef4444;
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .reset-btn:hover {
      background: #dc2626;
    }
  `]
})
export class AdvancedFiltersPopupComponent {
  @Input() filterDate: string = '';
  @Input() filterClient: string = '';
  @Input() onDateChange?: (value: string) => void;
  @Input() onClientChange?: (value: string) => void;
  @Input() onReset?: () => void;

  onDateChangeHandler(value: string) {
    this.onDateChange?.(value);
  }

  onClientChangeHandler(value: string) {
    this.onClientChange?.(value);
  }

  onResetHandler() {
    this.onReset?.();
  }
}
