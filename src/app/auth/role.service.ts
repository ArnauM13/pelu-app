import { inject, Injectable, signal, computed, effect } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';

export interface UserRole {
  uid: string;
  role: 'user' | 'stylist' | 'admin';
  displayName?: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  stylistInfo?: {
    businessName?: string;
    phone?: string;
    address?: string;
    specialties?: string[];
  };
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // Internal state
  private readonly userRoleSignal = signal<UserRole | null>(null);
  private readonly isLoadingRoleSignal = signal<boolean>(true);

  // Public computed signals
  readonly userRole = computed(() => this.userRoleSignal());
  readonly isLoadingRole = computed(() => this.isLoadingRoleSignal());
  readonly isStylist = computed(() => this.userRoleSignal()?.role === 'stylist');
  readonly isAdmin = computed(() => this.userRoleSignal()?.role === 'admin');
  readonly isUser = computed(() => this.userRoleSignal()?.role === 'user');
  readonly hasStylistAccess = computed(() =>
    this.userRoleSignal()?.role === 'stylist' || this.userRoleSignal()?.role === 'admin'
  );

  constructor() {
    this.initializeRoleListener();
  }

  private initializeRoleListener() {
    // Listen to auth changes and load user role
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.loadUserRole(user);
      } else {
        this.userRoleSignal.set(null);
        this.isLoadingRoleSignal.set(false);
      }
    });
  }

  private async loadUserRole(user: User) {
    try {
      this.isLoadingRoleSignal.set(true);
      const userDocRef = doc(this.firestore, 'users', user.uid);

      // Set up real-time listener for user role
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserRole;
          this.userRoleSignal.set({
            ...data,
            createdAt: data.createdAt instanceof Date ? data.createdAt : (data.createdAt as any)?.toDate() || new Date(),
            updatedAt: data.updatedAt instanceof Date ? data.updatedAt : (data.updatedAt as any)?.toDate() || new Date()
          });
        } else {
          // Create default user role if doesn't exist
          this.createDefaultUserRole(user);
        }
        this.isLoadingRoleSignal.set(false);
      }, (error) => {
        console.error('Error loading user role:', error);
        this.isLoadingRoleSignal.set(false);
      });

      // Store unsubscribe function for cleanup
      (this as any).unsubscribeRole = unsubscribe;
    } catch (error) {
      console.error('Error loading user role:', error);
      this.isLoadingRoleSignal.set(false);
    }
  }

  private async createDefaultUserRole(user: User) {
    const defaultRole: UserRole = {
      uid: user.uid,
      role: 'user',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    await this.setUserRole(defaultRole);
  }

  async setUserRole(userRole: UserRole): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', userRole.uid);
      await setDoc(userDocRef, {
        ...userRole,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error setting user role:', error);
      throw error;
    }
  }

  async updateUserRole(uid: string, updates: Partial<UserRole>): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async promoteToStylist(uid: string, stylistInfo?: UserRole['stylistInfo']): Promise<void> {
    await this.updateUserRole(uid, {
      role: 'stylist',
      stylistInfo: stylistInfo || {}
    });
  }

  async demoteToUser(uid: string): Promise<void> {
    await this.updateUserRole(uid, {
      role: 'user',
      stylistInfo: undefined
    });
  }

  async promoteToAdmin(uid: string): Promise<void> {
    await this.updateUserRole(uid, {
      role: 'admin'
    });
  }

  // Cleanup method
  cleanup() {
    if ((this as any).unsubscribeRole) {
      (this as any).unsubscribeRole();
    }
  }
}
