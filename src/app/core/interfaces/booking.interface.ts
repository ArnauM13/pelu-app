import { FieldValue } from '@angular/fire/firestore';

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface BookingForm {
  clientName: string;
  email: string;
  data: string;
  hora: string;
  notes?: string;
  serviceId: string;
}

export interface Booking {
  id: string; // This will be the ID of the booking
  clientName: string;
  email: string;
  uid?: string; // User ID from Firebase Auth
  data: string;
  hora: string;
  notes?: string;
  serviceId: string;
  status: 'draft' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date | string | FieldValue;
}

export interface AppointmentDetailData {
  booking: Booking;
  canEdit: boolean;
  canDelete: boolean;
  isOwner: boolean;
}
