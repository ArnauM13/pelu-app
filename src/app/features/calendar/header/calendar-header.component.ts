import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { format } from 'date-fns';
import { InputDateComponent } from '../../../shared/components/inputs/input-date/input-date.component';

@Component({
  selector: 'pelu-calendar-header',
  imports: [CommonModule, FormsModule, InputDateComponent],
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

  get todayDate(): Date {
    return new Date();
  }

  get todayString(): string {
    const today = this.todayDate;
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

  onDateChange(date: Date | string | null): void {
    if (date instanceof Date) {
      const dateString = format(date, 'yyyy-MM-dd');
      this.dateChange.emit(dateString);
    } else if (typeof date === 'string') {
      this.dateChange.emit(date);
    }
  }
}
