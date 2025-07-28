import { Component, input, output, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { format } from 'date-fns';
import { InputDateComponent } from '../../../shared/components/inputs/input-date/input-date.component';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';

@Component({
  selector: 'pelu-calendar-header',
  imports: [CommonModule, ReactiveFormsModule, InputDateComponent, ButtonComponent],
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CalendarHeaderComponent {
  // Inject FormBuilder
  private readonly fb = inject(FormBuilder);

  // Input signals
  readonly viewDateInfo = input<string>('');
  readonly businessDaysInfo = input<string>('');
  readonly mainTitle = input<string>('');
  readonly canNavigateToPreviousWeek = input<boolean>(true);
  readonly currentViewDate = input<Date>(new Date());

  // Output signals
  readonly today = output<void>();
  readonly dateChange = output<string>();

  // Reactive Form
  readonly dateForm: FormGroup;

  // Computed properties
  readonly currentDateString = computed(() =>
    format(this.currentViewDate(), 'yyyy-MM-dd')
  );

  readonly todayDate = computed(() => new Date());

  constructor() {
    // Initialize reactive form
    this.dateForm = this.fb.group({
      date: [this.currentViewDate()]
    });

    // Subscribe to form changes
    this.dateForm.valueChanges.subscribe(values => {
      if (values.date) {
        this.onDateChange(values.date);
      }
    });
  }

  emitToday() {
    this.today.emit();
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
