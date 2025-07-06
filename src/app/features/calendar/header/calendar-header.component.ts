import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pelu-calendar-header',
  standalone: true,
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss']
})
export class CalendarHeaderComponent {
  @Input() viewDateInfo: string = '';
  @Input() businessDaysInfo: string = '';
  @Input() mainTitle: string = '';
  @Input() canNavigateToPreviousWeek: boolean = true;

  @Output() today = new EventEmitter<void>();
  @Output() previousWeek = new EventEmitter<void>();
  @Output() nextWeek = new EventEmitter<void>();

  onToday() {
    this.today.emit();
  }
  onPreviousWeek() {
    this.previousWeek.emit();
  }
  onNextWeek() {
    this.nextWeek.emit();
  }
}
