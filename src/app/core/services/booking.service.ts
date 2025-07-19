import { Injectable, inject, signal, computed } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs, serverTimestamp } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { ServicesService, Service } from './services.service';
import { ToastService } from '../../shared/services/toast.service';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';

export interface Booking {
  id?: string;
  nom: string;
  email: string;
  data: string;
  hora: string;
  serviceName: string;
  serviceId: string;
  duration: number;
  price: number;
  notes?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  editToken: string;
  uid?: string | null; // null per usuaris anònims
  createdAt: any;
  updatedAt?: any;
}

export interface BookingDetails {
  date: string;
  time: string;
  clientName: string;
  email: string;
  service?: Service;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly servicesService = inject(ServicesService);
  private readonly toastService = inject(ToastService);

  // Signals
  private readonly bookingsSignal = signal<Booking[]>([]);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Computed properties
  readonly bookings = computed(() => this.bookingsSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly error = computed(() => this.errorSignal());

  /**
   * Create a new booking (authenticated or anonymous)
   */
  async createBooking(details: BookingDetails): Promise<Booking | null> {
    try {
      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      if (!details.email?.trim()) {
        throw new Error('Email is required');
      }

      if (!details.service) {
        throw new Error('Service is required');
      }

      const currentUser = this.authService.user();
      const editToken = nanoid(32); // Generate secure token

      const booking: Omit<Booking, 'id'> = {
        nom: details.clientName.trim(),
        email: details.email.trim().toLowerCase(),
        data: details.date,
        hora: details.time,
        serviceName: details.service.name,
        serviceId: details.service.id,
        duration: details.service.duration,
        price: details.service.price,
        status: 'confirmed',
        editToken,
        uid: currentUser?.uid || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Save to Firestore
      const docRef = await addDoc(collection(this.firestore, 'bookings'), booking);

      const newBooking: Booking = {
        ...booking,
        id: docRef.id
      };

      // Update local state
      this.bookingsSignal.update(bookings => [...bookings, newBooking]);

      // Send confirmation email
      await this.sendBookingConfirmationEmail(newBooking);

      this.toastService.showAppointmentCreated(details.clientName, docRef.id);

      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      this.errorSignal.set(error instanceof Error ? error.message : 'Error creating booking');
      this.toastService.showGenericError('Error creating booking');
      return null;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Get booking by edit token (for anonymous users)
   */
  async getBookingByToken(token: string): Promise<Booking | null> {
    try {
      const q = query(
        collection(this.firestore, 'bookings'),
        where('editToken', '==', token)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Booking;
    } catch (error) {
      console.error('Error getting booking by token:', error);
      return null;
    }
  }

  /**
   * Update booking (authenticated or by token)
   */
  async updateBooking(bookingId: string, updates: Partial<Booking>, token?: string): Promise<boolean> {
    try {
      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      const bookingRef = doc(this.firestore, 'bookings', bookingId);

      // Verify access
      if (token) {
        // Anonymous user - verify token
        const booking = await this.getBookingByToken(token);
        if (!booking || booking.id !== bookingId) {
          throw new Error('Invalid edit token');
        }
      } else {
        // Authenticated user - verify ownership
        const currentUser = this.authService.user();
        if (!currentUser?.uid) {
          throw new Error('Authentication required');
        }

        const booking = await this.getBookingById(bookingId);
        if (!booking || booking.uid !== currentUser.uid) {
          throw new Error('Access denied');
        }
      }

      // Update booking
      await updateDoc(bookingRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Update local state
      this.bookingsSignal.update(bookings =>
        bookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, ...updates, updatedAt: new Date() }
            : booking
        )
      );

      this.toastService.showAppointmentUpdated(updates.nom || 'Booking');
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      this.errorSignal.set(error instanceof Error ? error.message : 'Error updating booking');
      this.toastService.showGenericError('Error updating booking');
      return false;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Get booking by ID (authenticated users only)
   */
  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      const docRef = doc(this.firestore, 'bookings', bookingId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const booking = {
        id: docSnap.id,
        ...docSnap.data()
      } as Booking;

      // Verify ownership
      if (booking.uid !== currentUser.uid) {
        throw new Error('Access denied');
      }

      return booking;
    } catch (error) {
      console.error('Error getting booking by ID:', error);
      return null;
    }
  }

  /**
   * Link anonymous booking to user account
   */
  async linkBookingToUser(bookingId: string, userId: string): Promise<boolean> {
    try {
      const booking = await this.getBookingByToken(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      return await this.updateBooking(bookingId, { uid: userId });
    } catch (error) {
      console.error('Error linking booking to user:', error);
      return false;
    }
  }

  /**
   * Generate WhatsApp share URL
   */
  generateWhatsAppShareUrl(booking: Booking): string {
    const message = `Hola! Tinc una cita reservada per ${booking.nom} el ${booking.data} a les ${booking.hora} per ${booking.serviceName}.`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  /**
   * Generate edit URL for booking
   */
  generateEditUrl(booking: Booking): string {
    // Utilitzem un ID únic per a la ruta, però el token per a l'autenticació
    const uniqueId = `booking-${booking.id}`;
    return `${window.location.origin}/appointments/${uniqueId}?token=${booking.editToken}&edit=true`;
  }

  /**
   * Send booking confirmation email
   */
  private async sendBookingConfirmationEmail(booking: Booking): Promise<void> {
    try {
      // TODO: Implement email sending logic
      // This could be a Firebase Cloud Function or external service
      console.log('Sending confirmation email to:', booking.email);
      console.log('Edit link:', this.generateEditUrl(booking));

      // For now, just log the email details
      // In a real implementation, you would:
      // 1. Call a Cloud Function to send the email
      // 2. Include the edit token in the email
      // 3. Optionally attach PDF/ICS file
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't throw error - email failure shouldn't prevent booking creation
    }
  }

  /**
   * Generate PDF for booking
   */
  async generateBookingPDF(booking: Booking): Promise<Blob | null> {
    try {
      // TODO: Implement PDF generation
      // This could use jsPDF or similar library
      console.log('Generating PDF for booking:', booking.id);
      return null;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  }

  /**
   * Generate ICS file for booking
   */
  async generateBookingICS(booking: Booking): Promise<Blob | null> {
    try {
      // TODO: Implement ICS generation
      // This could use ics library or similar
      console.log('Generating ICS for booking:', booking.id);
      return null;
    } catch (error) {
      console.error('Error generating ICS:', error);
      return null;
    }
  }
}
