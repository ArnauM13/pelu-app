import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Booking } from '../interfaces/booking.interface';
import { FirebaseServicesService } from './firebase-services.service';
import { LoggerService } from '../../shared/services/logger.service';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root',
})
export class EmailJSService {
  private readonly translateService = inject(TranslateService);
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly logger = inject(LoggerService);

  // EmailJS configuration - you'll need to set these up
  private readonly EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
  private readonly EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Replace with your EmailJS template ID
  private readonly EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your EmailJS public key

  /**
   * Send booking confirmation email using EmailJS
   */
  async sendBookingConfirmationEmail(booking: Booking): Promise<void> {
    try {
      // Validate required fields
      if (!booking.email || !booking.clientName) {
        this.logger.warn('Missing required fields for email', {
          component: 'EmailJSService',
          method: 'sendBookingConfirmationEmail',
          data: JSON.stringify({ bookingId: booking.id, hasEmail: !!booking.email, hasName: !!booking.clientName })
        });
        return;
      }

      // Get service information from the services service
      const service = await this.firebaseServicesService.getServiceById(booking.serviceId);
      if (!service) {
        this.logger.warn('Service not found for email', {
          component: 'EmailJSService',
          method: 'sendBookingConfirmationEmail',
          data: JSON.stringify({ bookingId: booking.id, serviceId: booking.serviceId })
        });
        return;
      }

      const formattedPrice = this.formatPrice(service.price);
      const greeting = this.translateService.instant('BOOKING.EMAIL.GREETING', { clientName: booking.clientName });
      const subject = this.translateService.instant('BOOKING.EMAIL.SUBJECT');
      const serviceLabel = this.translateService.instant('BOOKING.EMAIL.SERVICE');
      const date = this.translateService.instant('BOOKING.EMAIL.DATE');
      const time = this.translateService.instant('BOOKING.EMAIL.TIME');
      const duration = this.translateService.instant('BOOKING.EMAIL.DURATION');
      const price = this.translateService.instant('BOOKING.EMAIL.PRICE');
      const notes = this.translateService.instant('BOOKING.EMAIL.NOTES');
      const noNotes = this.translateService.instant('BOOKING.EMAIL.NO_NOTES');
      const footer = this.translateService.instant('BOOKING.EMAIL.FOOTER');

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <p>${greeting}</p>
          <p><strong>${serviceLabel}:</strong> ${service.name}</p>
          <p>${service.description}</p>
          <p><strong>${date}:</strong> ${booking.data}</p>
          <p><strong>${time}:</strong> ${booking.hora}</p>
          <p><strong>${duration}:</strong> ${service.duration} min</p>
          <p><strong>${price}:</strong> ${formattedPrice}</p>
          <p><strong>${notes}:</strong> ${booking.notes || noNotes}</p>
          <p>${footer}</p>
        </div>
      `.trim();

      // Prepare template parameters for EmailJS
      const templateParams = {
        to_email: booking.email,
        to_name: booking.clientName,
        subject: subject,
        message: htmlContent,
        service_name: service.name,
        service_description: service.description,
        appointment_date: booking.data,
        appointment_time: booking.hora,
        duration: `${service.duration} min`,
        price: formattedPrice,
        notes: booking.notes || noNotes,
        booking_id: booking.id,
      };

      // Send email using EmailJS
      const result = await emailjs.send(
        this.EMAILJS_SERVICE_ID,
        this.EMAILJS_TEMPLATE_ID,
        templateParams,
        this.EMAILJS_PUBLIC_KEY
      );

      this.logger.info('Email sent successfully via EmailJS', {
        component: 'EmailJSService',
        method: 'sendBookingConfirmationEmail',
        data: JSON.stringify({
          bookingId: booking.id,
          to: booking.email,
          status: result.status,
          text: result.text,
        })
      });

    } catch (error) {
      this.logger.error('Error sending booking confirmation email via EmailJS', {
        component: 'EmailJSService',
        method: 'sendBookingConfirmationEmail',
        data: JSON.stringify({ 
          bookingId: booking.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      });
      throw error;
    }
  }

  /**
   * Format price for display
   */
  private formatPrice(price: number): string {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }

  /**
   * Initialize EmailJS (call this in your app initialization)
   */
  initializeEmailJS(): void {
    emailjs.init(this.EMAILJS_PUBLIC_KEY);
  }
}
