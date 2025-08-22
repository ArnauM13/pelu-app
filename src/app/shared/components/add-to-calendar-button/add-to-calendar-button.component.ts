import { Component, Input, inject, ViewEncapsulation, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddToCalendarService, CalendarEventData } from '../../../core/services/calendar.service';

// Interface for calendar button attributes
interface CalendarButtonAttributes {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  options: string;
  timeZone: string;
  trigger: string;
  inline: string;
  listStyle: string;
  iCalFileName: string;
}

@Component({
  selector: 'pelu-add-to-calendar-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-to-calendar-button.component.html',
  styleUrls: ['./add-to-calendar-button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddToCalendarButtonComponent {
  @Input() eventData!: CalendarEventData;
  @Input() label: string = 'COMMON.CALENDAR.ADD_TO_CALENDAR';
  @Input() variant: 'primary' | 'secondary' | 'outlined' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';


  private readonly addToCalendarService = inject(AddToCalendarService);

  // Computed properties for the calendar button attributes
  readonly calendarAttributes = computed((): CalendarButtonAttributes => {
    if (!this.eventData) {
      return {
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        location: '',
        options: '',
        timeZone: '',
        trigger: '',
        inline: '',
        listStyle: '',
        iCalFileName: ''
      };
    }

    // Use the centralized calendar service to create the calendar button
    const calendarButton = this.addToCalendarService.createCalendarButton(this.eventData);

    // Extract attributes from the created button element
    const attributes: CalendarButtonAttributes = {
      name: calendarButton.getAttribute('name') || '',
      description: calendarButton.getAttribute('description') || '',
      startDate: calendarButton.getAttribute('startDate') || '',
      endDate: calendarButton.getAttribute('endDate') || '',
      startTime: calendarButton.getAttribute('startTime') || '',
      endTime: calendarButton.getAttribute('endTime') || '',
      location: calendarButton.getAttribute('location') || '',
      options: calendarButton.getAttribute('options') || '',
      timeZone: calendarButton.getAttribute('timeZone') || '',
      trigger: calendarButton.getAttribute('trigger') || '',
      inline: calendarButton.getAttribute('inline') || '',
      listStyle: calendarButton.getAttribute('listStyle') || '',
      iCalFileName: calendarButton.getAttribute('iCalFileName') || ''
    };

    return attributes;
  });

  // Computed CSS variables for styling
  readonly buttonStyles = computed(() => {
    let styles = '';

    // Apply variant styling
    switch (this.variant) {
      case 'primary':
        styles += '--btn-background: var(--primary-color); --btn-color: white;';
        break;
      case 'secondary':
        styles += '--btn-background: var(--secondary-color); --btn-color: white;';
        break;
      case 'outlined':
        styles += '--btn-background: transparent; --btn-color: var(--primary-color); --btn-border: 1px solid var(--primary-color);';
        break;
    }

    // Apply size styling
    switch (this.size) {
      case 'small':
        styles += ' --btn-size: 0.8rem; --btn-padding: 0.5rem 1rem;';
        break;
      case 'large':
        styles += ' --btn-size: 1.2rem; --btn-padding: 1rem 2rem;';
        break;
    }

    return styles;
  });
}
