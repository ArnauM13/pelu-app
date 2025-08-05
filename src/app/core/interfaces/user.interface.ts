/**
 * Interfície global per a usuaris del sistema
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Rols d'usuari disponibles
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

/**
 * Interfície per a dades de perfil d'usuari
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

/**
 * Preferències d'usuari
 */
export interface UserPreferences {
  language?: string;
  timezone?: string;
  notifications?: NotificationSettings;
}

/**
 * Configuració de notificacions
 */
export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
}
