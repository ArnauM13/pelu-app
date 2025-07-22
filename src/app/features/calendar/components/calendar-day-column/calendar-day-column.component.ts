import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentEvent } from '../../core/calendar.component';
import { AppointmentSlotComponent, AppointmentSlotData } from '../../slots/appointment-slot.component';
import { CalendarDayHeaderComponent, DayHeaderData } from '../calendar-day-header/calendar-day-header.component';
import { CalendarTimeSlotComponent, TimeSlotData } from '../calendar-time-slot/calendar-time-slot.component';
import { CalendarLunchBreakComponent, LunchBreakData } from '../calendar-lunch-break/calendar-lunch-break.component';
import { CalendarDropIndicatorComponent, DropIndicatorData } from '../calendar-drop-indicator/calendar-drop-indicator.component';

export interface DayColumnData {
  date: Date;
  dayName: string;
  dayDate: string;
  isPast: boolean;
  isDisabled: boolean;
  timeSlots: TimeSlotData[];
  appointments: AppointmentEvent[];
  lunchBreak: LunchBreakData | null;
  dropIndicator: DropIndicatorData | null;
  isDragOver: boolean;
  isDropValid: boolean;
  isDropInvalid: boolean;
}

@Component({
  selector: 'pelu-calendar-day-column',
  standalone: true,
  imports: [
    CommonModule,
    AppointmentSlotComponent,
    CalendarDayHeaderComponent,
    CalendarTimeSlotComponent,
    CalendarLunchBreakComponent,
    CalendarDropIndicatorComponent
  ],
  template: `
    <div class="day-column"
         [class.past]="data().isPast"
         [class.disabled]="data().isDisabled">

      <!-- Day Header -->
      <pelu-calendar-day-header
        [data]="dayHeaderData()">
      </pelu-calendar-day-header>

      <!-- Time Slots Container -->
      <div class="time-slots-container"
           [class.drag-over]="data().isDragOver"
           [class.drop-valid]="data().isDropValid"
           [class.drop-invalid]="data().isDropInvalid"
           (mouseenter)="onDropZoneMouseEnter($event)"
           (mousemove)="onDropZoneMouseMove($event)"
           (drop)="onDropZoneDrop($event)"
           (dragover)="onDropZoneDragOver($event)">

        <!-- Time Slots -->
        @for (timeSlot of data().timeSlots; track timeSlot.time; let k = $index) {
          <pelu-calendar-time-slot
            [data]="timeSlot"
            (clicked)="onTimeSlotClick($event)">
          </pelu-calendar-time-slot>
        }

        <!-- Lunch Break Overlay -->
        @if (data().lunchBreak) {
          <pelu-calendar-lunch-break
            [data]="data().lunchBreak!">
          </pelu-calendar-lunch-break>
        }

        <!-- Appointments -->
        @for (appt of data().appointments; track appt.id + '-' + appt.start) {
          @if (appt && appt.start) {
            <pelu-appointment-slot
              [data]="createAppointmentSlotData(appt)"
              (clicked)="onAppointmentClick($event)">
            </pelu-appointment-slot>
          }
        }

        <!-- Drop Indicator -->
        @if (data().dropIndicator) {
          <pelu-calendar-drop-indicator
            [data]="data().dropIndicator!">
          </pelu-calendar-drop-indicator>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      width: stretch;
    }

    .day-column {
      border-right: 1px solid #e9ecef;
      background: white;
      display: grid;
      grid-template-rows: 40px repeat(var(--calendar-slot-count, 24), 30px);
    }

    .day-column:last-child {
      border-right: none;
    }

    .day-column.past {
      opacity: 0.5;
      background: #f8f9fa;
    }

    .day-column.disabled {
      opacity: 0.5;
    }

    .time-slots-container {
      position: relative;
      grid-row: 2 / -1;
      display: grid;
      grid-template-rows: repeat(var(--calendar-slot-count, 24), 30px);
      min-height: calc(var(--calendar-slot-count, 24) * 30px);
    }

    .time-slots-container.drag-over {
      background: rgba(52, 152, 219, 0.05);
    }

    .time-slots-container.drop-valid {
      background: rgba(40, 167, 69, 0.05);
    }

    .time-slots-container.drop-invalid {
      background: rgba(220, 53, 69, 0.05);
    }
  `]
})
export class CalendarDayColumnComponent {
  readonly data = input.required<DayColumnData>();

  // Output events
  readonly timeSlotClicked = output<{date: Date, time: string}>();
  readonly appointmentClicked = output<AppointmentEvent>();
  readonly dropZoneMouseEnter = output<MouseEvent>();
  readonly dropZoneMouseMove = output<MouseEvent>();
  readonly dropZoneDrop = output<DragEvent>();
  readonly dropZoneDragOver = output<DragEvent>();

  // Computed day header data
  readonly dayHeaderData = () => ({
    date: this.data().date,
    dayName: this.data().dayName,
    dayDate: this.data().dayDate,
    isPast: this.data().isPast,
    isDisabled: this.data().isDisabled
  } as DayHeaderData);

  onTimeSlotClick(event: {date: Date, time: string}): void {
    this.timeSlotClicked.emit(event);
  }

  onAppointmentClick(appointment: AppointmentEvent): void {
    this.appointmentClicked.emit(appointment);
  }

  onDropZoneMouseEnter(event: MouseEvent): void {
    this.dropZoneMouseEnter.emit(event);
  }

  onDropZoneMouseMove(event: MouseEvent): void {
    this.dropZoneMouseMove.emit(event);
  }

  onDropZoneDrop(event: DragEvent): void {
    this.dropZoneDrop.emit(event);
  }

  onDropZoneDragOver(event: DragEvent): void {
    this.dropZoneDragOver.emit(event);
  }

  createAppointmentSlotData(appointment: AppointmentEvent): AppointmentSlotData {
    return {
      appointment,
      date: this.data().date
    };
  }
}
