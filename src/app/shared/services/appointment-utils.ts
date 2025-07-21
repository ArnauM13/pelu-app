import { v4 as uuidv4 } from 'uuid';

export interface Appointment {
  id?: string;
  nom: string;
  data: string;
  hora?: string;
  servei?: string;
  serviceName?: string;
  duration?: number;
  preu?: number;
  notes?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Migrate old appointments by adding missing IDs and userId
 * @param appointments Array of appointments to migrate
 * @param currentUserId Current user ID to assign to appointments without userId
 * @returns Migrated appointments array
 */
export function migrateOldAppointments(appointments: Appointment[], currentUserId?: string): Appointment[] {
  return appointments.map(appointment => {
    let updatedAppointment = { ...appointment };

    // Add ID if missing
    if (!updatedAppointment.id) {
      updatedAppointment.id = uuidv4();
    }

    // Add userId if missing and user is logged in
    if (currentUserId && (!updatedAppointment.userId || updatedAppointment.userId === null || updatedAppointment.userId === undefined)) {
      updatedAppointment.userId = currentUserId;
    }

    return updatedAppointment;
  });
}

/**
 * Check if appointments need migration
 * @param originalAppointments Original appointments array
 * @param migratedAppointments Migrated appointments array
 * @returns True if any appointment was migrated
 */
export function needsMigration(originalAppointments: Appointment[], migratedAppointments: Appointment[]): boolean {
  return migratedAppointments.some((appointment, index) => {
    const original = originalAppointments[index];
    return appointment.id !== original?.id || appointment.userId !== original?.userId;
  });
}

/**
 * Save migrated appointments to localStorage
 * @param appointments Migrated appointments to save
 */
export function saveMigratedAppointments(appointments: Appointment[]): void {
  try {
    localStorage.setItem('cites', JSON.stringify(appointments));
  } catch (error) {
    console.error('Error saving migrated appointments:', error);
  }
}

/**
 * Run a one-time migration of all old appointments in localStorage
 * This function should be called once when the app starts
 * @param currentUserId Current user ID to assign to appointments without userId
 * @returns Number of appointments that were migrated
 */
export function runOneTimeMigration(currentUserId?: string): number {
  try {
    const appointments = JSON.parse(localStorage.getItem('cites') || '[]');

    if (appointments.length === 0) {
      return 0;
    }

    const migratedAppointments = migrateOldAppointments(appointments, currentUserId);
    const hasChanges = needsMigration(appointments, migratedAppointments);

    if (hasChanges) {
      saveMigratedAppointments(migratedAppointments);
      console.log(`Migrated ${migratedAppointments.length} appointments`);
      return migratedAppointments.length;
    }

    return 0;
  } catch (error) {
    console.error('Error during one-time migration:', error);
    return 0;
  }
}

/**
 * Check if one-time migration has been completed
 * @returns True if migration has been completed
 */
export function isMigrationCompleted(): boolean {
  try {
    const migrationFlag = localStorage.getItem('appointment_migration_completed');
    return migrationFlag === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark one-time migration as completed
 */
export function markMigrationCompleted(): void {
  try {
    localStorage.setItem('appointment_migration_completed', 'true');
  } catch (error) {
    console.error('Error marking migration as completed:', error);
  }
}

export function isFutureAppointment(appointment: { data: string, hora: string }): boolean {
  if (!appointment?.data || !appointment?.hora) return false;
  const now = new Date();
  const citaDate = new Date(`${appointment.data}T${appointment.hora}:00`);
  return citaDate > now;
}

export function isPastDateTime(data: string, hora: string): boolean {
  if (!data || !hora) return false;
  const now = new Date();
  const appointmentDateTime = new Date(`${data}T${hora}:00`);
  return appointmentDateTime <= now;
}
