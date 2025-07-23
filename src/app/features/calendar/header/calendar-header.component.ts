import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { format } from 'date-fns';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'pelu-calendar-header',
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss'],
})
export class CalendarHeaderComponent {
  @Input() viewDateInfo: string = '';
  @Input() businessDaysInfo: string = '';
  @Input() mainTitle: string = '';
  @Input() canNavigateToPreviousWeek: boolean = true;
  @Input() currentViewDate: Date = new Date();

  @Output() today = new EventEmitter<void>();
  @Output() previousWeek = new EventEmitter<void>();
  @Output() nextWeek = new EventEmitter<void>();
  @Output() dateChange = new EventEmitter<string>();

  get currentDateString(): string {
    return format(this.currentViewDate, 'yyyy-MM-dd');
  }

  get todayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onToday() {
    this.today.emit();
  }

  onPreviousWeek() {
    this.previousWeek.emit();
  }

  onNextWeek() {
    this.nextWeek.emit();
  }

  onDateChange(event: any): void {
    const value = event.target.value;
    if (value) {
      this.dateChange.emit(value);
    }
  }
}
