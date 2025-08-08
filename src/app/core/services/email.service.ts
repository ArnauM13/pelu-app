import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Booking } from '../interfaces/booking.interface';
import { FirebaseServicesService } from './firebase-services.service';
import { LoggerService } from '../../shared/services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private readonly translateService = inject(TranslateService);
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly logger = inject(LoggerService);

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmationEmail(booking: Booking): Promise<void> {
    try {
      // Validate required fields
      if (!booking.email || !booking.clientName) {
        this.logger.warn('Missing required fields for email', {
          component: 'EmailService',
          method: 'sendBookingConfirmationEmail',
          data: JSON.stringify({ bookingId: booking.id, hasEmail: !!booking.email, hasName: !!booking.clientName })
        });
        return;
      }

      // Get service information from the services service
      const service = await this.firebaseServicesService.getServiceById(booking.serviceId);
      if (!service) {
        this.logger.warn('Service not found for email', {
          component: 'EmailService',
          method: 'sendBookingConfirmationEmail',
          data: JSON.stringify({ bookingId: booking.id, serviceId: booking.serviceId })
        });
        return;
      }

      const emailData = {
        clientName: booking.clientName,
        email: booking.email,
        data: booking.data,
        hora: booking.hora,
        serviceName: service.name,
        serviceDescription: service.description,
        price: service.price,
        duration: service.duration,
        notes: booking.notes || '',
        bookingId: booking.id,
      };

      await this.sendEmailViaAPI(emailData);

    } catch (error) {
      this.logger.error('Error sending booking confirmation email', {
        component: 'EmailService',
        method: 'sendBookingConfirmationEmail',
        data: JSON.stringify({ bookingId: booking.id, error: error instanceof Error ? error.message : 'Unknown error' })
      });
    }
  }

  /**
   * Send email via API
   */
  private async sendEmailViaAPI(data: {
    clientName: string;
    email: string;
    data: string;
    hora: string;
    serviceName: string;
    serviceDescription: string;
    price: number;
    duration: number;
    notes: string;
    bookingId: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const formattedPrice = this.formatPrice(data.price);
      const greeting = this.translateService.instant('BOOKING.EMAIL.GREETING', { clientName: data.clientName });
      const subject = this.translateService.instant('BOOKING.EMAIL.SUBJECT');
      const service = this.translateService.instant('BOOKING.EMAIL.SERVICE');
      const date = this.translateService.instant('BOOKING.EMAIL.DATE');
      const time = this.translateService.instant('BOOKING.EMAIL.TIME');
      const duration = this.translateService.instant('BOOKING.EMAIL.DURATION');
      const price = this.translateService.instant('BOOKING.EMAIL.PRICE');
      const notes = this.translateService.instant('BOOKING.EMAIL.NOTES');
      const noNotes = this.translateService.instant('BOOKING.EMAIL.NO_NOTES');
      const footer = this.translateService.instant('BOOKING.EMAIL.FOOTER');

      const emailContent = `
${greeting}

${subject}

${service}: ${data.serviceName}
${data.serviceDescription}

${date}: ${data.data}
${time}: ${data.hora}
${duration}: ${data.duration} min
${price}: ${formattedPrice}

${notes}: ${data.notes || noNotes}

${footer}
      `.trim();

      // For now, just log the email content
      // In a real implementation, you would send this via your email API
      this.logger.info('Email content generated', {
        component: 'EmailService',
        method: 'sendEmailViaAPI',
        data: JSON.stringify({
          to: data.email,
          subject,
          content: emailContent,
          bookingId: data.bookingId
        })
      });

      return { success: true };

    } catch (error) {
      this.logger.error('Error sending email via API', {
        component: 'EmailService',
        method: 'sendEmailViaAPI',
        data: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })
      });

      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
}
