import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FirebaseServicesService, FirebaseService } from './firebase-services.service';
import { SystemParametersService } from './system-parameters.service';
import { Booking } from '../interfaces/booking.interface';

export interface CalendarEventData {
  clientName: string;
  email: string;
  date: string;
  time: string;
  serviceName: string;
  duration: number;
  price: number;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddToCalendarService {
  private translateService = inject(TranslateService);
  private firebaseServicesService = inject(FirebaseServicesService);
  private systemParametersService = inject(SystemParametersService);

  /**
   * Creates calendar event data from a booking object
   * This is the centralized method that retrieves all real data
   */
  async createCalendarEventDataFromBooking(booking: Booking): Promise<CalendarEventData | null> {
    if (!booking) {
      return null;
    }

    try {
      // Get service details from Firebase
      const service = await this.getServiceById(booking.serviceId);

      if (!service) {
        console.warn(`Service not found for booking: ${booking.serviceId}`);
        return null;
      }

      // Get business information from system parameters
      const businessName = this.systemParametersService.getBusinessName();
      const businessAddress = this.systemParametersService.getBusinessAddress();
      const businessPhone = this.systemParametersService.getBusinessPhone();

      return {
        clientName: booking.clientName || '',
        email: booking.email || '',
        date: booking.data || '',
        time: booking.hora || '',
        serviceName: service.name,
        duration: service.duration,
        price: service.price,
        businessName,
        businessAddress,
        businessPhone
      };
    } catch (error) {
      console.error('Error creating calendar event data from booking:', error);
      return null;
    }
  }

  /**
   * Creates calendar event data from booking details (for booking mobile page)
   * This is used when creating a new booking
   */
  createCalendarEventDataFromDetails(
    clientName: string,
    email: string,
    date: string,
    time: string,
    serviceId: string,
    serviceName?: string,
    duration?: number,
    price?: number
  ): CalendarEventData {
    // Get business information from system parameters
    const businessName = this.systemParametersService.getBusinessName();
    const businessAddress = this.systemParametersService.getBusinessAddress();
    const businessPhone = this.systemParametersService.getBusinessPhone();

    return {
      clientName: clientName || '',
      email: email || '',
      date: date || '',
      time: time || '',
      serviceName: serviceName || 'Servei',
      duration: duration || 60,
      price: price || 0,
      businessName,
      businessAddress,
      businessPhone
    };
  }

  /**
   * Gets service details by ID from Firebase
   */
  private async getServiceById(serviceId: string): Promise<FirebaseService | null> {
    try {
      // First try to get from the active services in memory
      const activeServices = this.firebaseServicesService.activeServices();
      const service = activeServices.find(s => s.id === serviceId);

      if (service) {
        return service;
      }

      // If not found in memory, try to load services
      await this.firebaseServicesService.loadServices();
      const updatedServices = this.firebaseServicesService.activeServices();
      return updatedServices.find(s => s.id === serviceId) || null;
    } catch (error) {
      console.error('Error getting service by ID:', error);
      return null;
    }
  }

  /**
   * Creates an add-to-calendar button element with the provided event data
   */
  createCalendarButton(eventData: CalendarEventData): HTMLElement {
    const {
      clientName,
      date,
      time,
      serviceName,
      duration,
      businessAddress = ''
    } = eventData;

    // Parse date and time
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    // Create start and end dates
    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    // Format dates for the calendar button (YYYY-MM-DD format)
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    // Format time for the calendar button (HH:MM format)
    const formatTime = (date: Date): string => {
      return date.toTimeString().slice(0, 5);
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    const startTimeStr = formatTime(startDate);
    const endTimeStr = formatTime(endDate);

    // Create the calendar button element
    const calendarButton = document.createElement('add-to-calendar-button');

    // Set the attributes for the calendar button
    calendarButton.setAttribute('name', `${serviceName} - ${clientName}`);
    calendarButton.setAttribute('description', this.translateService.instant('CALENDAR.EVENT_DESCRIPTION', {
      serviceName,
      clientName
    }));
    calendarButton.setAttribute('startDate', startDateStr);
    calendarButton.setAttribute('endDate', endDateStr);
    calendarButton.setAttribute('startTime', startTimeStr);
    calendarButton.setAttribute('endTime', endTimeStr);
    calendarButton.setAttribute('location', businessAddress);
    calendarButton.setAttribute('options', JSON.stringify(['Apple', 'Google', 'iCal', 'Microsoft365', 'Outlook.com', 'Yahoo']));
    calendarButton.setAttribute('timeZone', 'Europe/Madrid');
    calendarButton.setAttribute('trigger', 'click');
    calendarButton.setAttribute('inline', 'true');
    calendarButton.setAttribute('listStyle', 'modal');
    calendarButton.setAttribute('iCalFileName', `reserva_${serviceName.replace(/[^a-zA-Z0-9]/g, '_')}_${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${startDateStr.replace(/-/g, '')}`);

    return calendarButton;
  }

  /**
   * Adds an event to the user's calendar using the add-to-calendar-button library
   */
  addToCalendar(eventData: CalendarEventData): void {
    const calendarButton = this.createCalendarButton(eventData);

    // Add the button to the document temporarily
    calendarButton.style.position = 'absolute';
    calendarButton.style.left = '-9999px';
    calendarButton.style.top = '-9999px';
    document.body.appendChild(calendarButton);

    // Trigger the calendar button click
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    calendarButton.dispatchEvent(clickEvent);

    // Remove the button from the document after a short delay
    setTimeout(() => {
      if (document.body.contains(calendarButton)) {
        document.body.removeChild(calendarButton);
      }
    }, 1000);
  }

  /**
   * Creates a calendar button element that can be used in templates
   */
  getCalendarButtonElement(eventData: CalendarEventData): HTMLElement {
    return this.createCalendarButton(eventData);
  }
}
