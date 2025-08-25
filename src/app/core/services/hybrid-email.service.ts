import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Booking } from '../interfaces/booking.interface';
import { FirebaseServicesService } from './firebase-services.service';
import { LoggerService } from '../../shared/services/logger.service';
import { SystemParametersService } from './system-parameters.service';
import { environment } from '../../../environments/environment';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from './emailjs-config';
import { FirebaseService } from './firebase-services.service';

interface EmailTemplateParams {
  order_id: string; // booking_id
  image_url: string; // assets/images/peluapp-dark-thick.svg
  name: string; // client_name
  price: string; // service_price
  cost: string; // service_cost
  email: string; // user_email
  [key: string]: string; // Allow additional string properties for emailjs.send
}

@Injectable({
  providedIn: 'root',
})
export class HybridEmailService {
  private readonly translateService = inject(TranslateService);
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly logger = inject(LoggerService);
  private readonly systemParametersService = inject(SystemParametersService);

  // EmailJS configuration
  private readonly EMAILJS_SERVICE_ID = EMAILJS_CONFIG.SERVICE_ID;
  private readonly EMAILJS_TEMPLATE_ID = EMAILJS_CONFIG.TEMPLATE_ID;
  private readonly EMAILJS_PUBLIC_KEY = EMAILJS_CONFIG.PUBLIC_KEY;

  // Check if we're using demo credentials
  private readonly isDemoMode = this.EMAILJS_SERVICE_ID === 'service_demo' ||
                               this.EMAILJS_TEMPLATE_ID === 'template_demo' ||
                               this.EMAILJS_PUBLIC_KEY === 'demo_key' ||
                               this.EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY';

  /**
   * Send booking confirmation email
   *
   * This method is called automatically when a booking is created.
   * Currently disabled - not called when bookings are created.
   * To enable email sending, uncomment the call in booking.service.ts
   */
  async sendBookingConfirmationEmail(booking: Booking): Promise<void> {
    try {
      // Validate required fields
      if (!booking.email || !booking.clientName) {
        this.logger.warn('Missing required fields for email', {
          component: 'HybridEmailService',
          method: 'sendBookingConfirmationEmail',
          data: JSON.stringify({ bookingId: booking.id, hasEmail: !!booking.email, hasName: !!booking.clientName })
        });
        return;
      }

      // Get service information from the services service
      const service = await this.firebaseServicesService.getServiceById(booking.serviceId);
      if (!service) {
        this.logger.warn('Service not found for email', {
          component: 'HybridEmailService',
          method: 'sendBookingConfirmationEmail',
          data: JSON.stringify({ bookingId: booking.id, serviceId: booking.serviceId })
        });
        return;
      }

      // Choose email method based on environment and demo mode
      if (environment.production && !this.isDemoMode) {
        await this.sendEmailViaAPI(booking, service);
      } else {
        await this.sendEmailViaEmailJS(booking, service);
      }

    } catch (error) {
      this.logger.error('Error sending booking confirmation email', {
        component: 'HybridEmailService',
        method: 'sendBookingConfirmationEmail',
        data: JSON.stringify({ bookingId: booking.id, error: error instanceof Error ? error.message : 'Unknown error' })
      });
    }
  }

  /**
   * Send email via EmailJS
   *
   * Uses the configured EmailJS service to send emails.
   * In demo mode, simulates the email sending process.
   * In real mode, sends actual emails to clients.
   */
  private async sendEmailViaEmailJS(booking: Booking, service: FirebaseService): Promise<void> {
    try {
      const formattedPrice = this.formatPrice(service.price);

      // Prepare template parameters for EmailJS
      const templateParams: EmailTemplateParams = {
        order_id: booking.id,
        image_url: 'assets/images/peluapp-dark-thick.svg',
        name: booking.clientName,
        price: formattedPrice,
        cost: formattedPrice, // Using same as price for now
        email: booking.email,
      };

      // If in demo mode, simulate email sending
      if (this.isDemoMode) {
        await this.simulateEmailSending(templateParams);
        return;
      }

      // Send email using EmailJS
      const result = await emailjs.send(
        this.EMAILJS_SERVICE_ID,
        this.EMAILJS_TEMPLATE_ID,
        templateParams,
        this.EMAILJS_PUBLIC_KEY
      );

      this.logger.info('Email sent successfully via EmailJS', {
        component: 'HybridEmailService',
        method: 'sendEmailViaEmailJS',
        data: JSON.stringify({
          bookingId: booking.id,
          to: booking.email,
          status: result.status,
          text: result.text,
        })
      });

    } catch (error) {
      this.logger.error('Error sending email via EmailJS', {
        component: 'HybridEmailService',
        method: 'sendEmailViaEmailJS',
        data: JSON.stringify({
          bookingId: booking.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      });
      throw error;
    }
  }

  /**
   * Simulate email sending for demo mode
   *
   * This method is called when the system is in demo mode.
   * It simulates the email sending process without actually sending emails.
   * Useful for testing and development.
   */
  private async simulateEmailSending(templateParams: EmailTemplateParams): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.logger.info('Email simulation completed (demo mode)', {
      component: 'HybridEmailService',
      method: 'simulateEmailSending',
      data: JSON.stringify({
        to: templateParams.email,
        name: templateParams.name,
        orderId: templateParams.order_id,
        price: templateParams.price,
        demoMode: true,
      })
    });

    // Show a console message for demo purposes
    console.log('📧 EMAIL SIMULATION (Demo Mode)');
    console.log('To:', templateParams.email);
    console.log('Name:', templateParams.name);
    console.log('Order ID:', templateParams.order_id);
    console.log('Price:', templateParams.price);
    console.log('Image URL:', templateParams.image_url);
    console.log('---');
    console.log('To send real emails, configure your EmailJS credentials in emailjs-config.ts');
  }

  /**
   * Send email via API (for production)
   *
   * This method is used in production environment when deployed to Vercel.
   * It calls the serverless function /api/send-email to send emails.
   * Currently not used as EmailJS is the primary method.
   */
  private async sendEmailViaAPI(booking: Booking, service: FirebaseService): Promise<{ success: boolean; error?: string }> {
    try {
      const formattedPrice = this.formatPrice(service.price);
      const greeting = this.translateService.instant('BOOKING.EMAIL.GREETING', { clientName: booking.clientName });
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

      // Build payload for Vercel serverless function
      const subjectLine = this.translateService.instant('BOOKING.EMAIL.SUBJECT');
      const payload = {
        to: booking.email,
        subject: subjectLine,
        html: htmlContent,
      } as const;

      // Call the API route deployed on Vercel (same domain)
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseBody: unknown = await response.json().catch(() => ({}));

      if (!response.ok) {
        const hasErrorField = (value: unknown): value is { error?: unknown; details?: unknown } =>
          typeof value === 'object' && value !== null && (('error' in (value as Record<string, unknown>)) || ('details' in (value as Record<string, unknown>)));

        const errorMessage = hasErrorField(responseBody)
          ? String((responseBody.error || responseBody.details) ?? `HTTP ${response.status}`)
          : `HTTP ${response.status}`;

        this.logger.error('Email API call failed', {
          component: 'HybridEmailService',
          method: 'sendEmailViaAPI',
          data: JSON.stringify({
            bookingId: booking.id,
            to: booking.email,
            status: response.status,
            error: errorMessage,
            serverResponse: responseBody,
          })
        });

        return { success: false, error: errorMessage };
      }

      this.logger.info('Email sent via API', {
        component: 'HybridEmailService',
        method: 'sendEmailViaAPI',
        data: JSON.stringify({
          bookingId: booking.id,
          to: booking.email,
          apiResponse: responseBody,
        })
      });

      return { success: true };

    } catch (error) {
      this.logger.error('Error sending email via API', {
        component: 'HybridEmailService',
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

  /**
   * Initialize EmailJS
   *
   * This method is called automatically when the app starts.
   * It initializes EmailJS with the configured public key.
   * Public Key is configured but email sending is disabled.
   */
  initializeEmailJS(): void {
    if (!environment.production || this.isDemoMode) {
      if (this.isDemoMode) {
        console.log('📧 EmailJS initialized in DEMO MODE');
        console.log('To send real emails, configure your EmailJS credentials in emailjs-config.ts');
      } else {
        emailjs.init(this.EMAILJS_PUBLIC_KEY);
        console.log('📧 EmailJS initialized for development');
      }
    }
  }

  /**
   * Check if we're in demo mode
   *
   * Returns true if the system is configured to simulate emails instead of sending real ones.
   * Currently always returns false as Public Key is configured.
   */
  isInDemoMode(): boolean {
    return this.isDemoMode;
  }
}
