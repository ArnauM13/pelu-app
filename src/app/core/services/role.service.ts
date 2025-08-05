import { inject, Injectable, signal, computed } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  getDocs,
  deleteDoc,
  CollectionReference,
  DocumentData,
} from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { UserRole as AppUserRole } from '../interfaces/user.interface';

export interface UserRole {
  uid: string;
  email: string;
  lang: string;
  role: 'client' | 'admin';
  theme: string;
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
  readonly isClient = computed(() => this.userRoleSignal()?.role === 'client');
  readonly isAdmin = computed(() => this.userRoleSignal()?.role === 'admin');
  readonly hasAdminAccess = computed(() => this.userRoleSignal()?.role === 'admin');

  constructor() {
    this.initializeRoleListener();
  }

  private initializeRoleListener() {
    onAuthStateChanged(this.auth, user => {
      if (user) {
        this.loadUserRole(user);
      } else {
        // Use setTimeout to avoid signal write conflicts
        setTimeout(() => {
          this.userRoleSignal.set(null);
          this.isLoadingRoleSignal.set(false);
        }, 0);
      }
    });
  }

  private async loadUserRole(user: User) {
    try {
      console.log('🔄 RoleService: Loading user role for:', user.uid);

      // Use setTimeout to avoid signal write conflicts
      setTimeout(() => {
        this.isLoadingRoleSignal.set(true);
      }, 0);

      const userDocRef = doc(this.firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(
        userDocRef,
        doc => {
          if (doc.exists()) {
            const data = doc.data() as UserRole;
            console.log('✅ RoleService: User role loaded:', data);
            // Use setTimeout to avoid signal write conflicts
            setTimeout(() => {
              this.userRoleSignal.set(data);
              this.isLoadingRoleSignal.set(false);
            }, 0);
          } else {
            console.log('⚠️ RoleService: User role not found, creating default');
            this.createDefaultUserRole(user);
          }
        },
        error => {
          console.error('❌ RoleService: Error loading user role:', error);
          // Use setTimeout to avoid signal write conflicts
          setTimeout(() => {
            this.isLoadingRoleSignal.set(false);
          }, 0);
        }
      );
      (this as any).unsubscribeRole = unsubscribe;
    } catch (error) {
      console.error('❌ RoleService: Error in loadUserRole:', error);
      // Use setTimeout to avoid signal write conflicts
      setTimeout(() => {
        this.isLoadingRoleSignal.set(false);
      }, 0);
    }
  }

  private async createDefaultUserRole(user: User) {
    console.log('🆕 RoleService: Creating default user role for:', user.uid);
    const defaultRole: UserRole = {
      uid: user.uid,
      email: user.email || '',
      lang: 'ca',
      role: 'client',
      theme: 'light',
    };
    await this.setUserRole(defaultRole);
    console.log('✅ RoleService: Default user role created:', defaultRole);
  }

  async setUserRole(userRole: UserRole): Promise<void> {
    try {
      console.log('💾 RoleService: Setting user role:', userRole);
      const userDocRef = doc(this.firestore, 'users', userRole.uid);
      await setDoc(userDocRef, userRole);
      console.log('✅ RoleService: User role set successfully');
    } catch (error) {
      console.error('❌ RoleService: Error setting user role:', error);
      throw error;
    }
  }

  async updateUserRole(uid: string, updates: Partial<UserRole>): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      await updateDoc(userDocRef, updates);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      await deleteDoc(userDocRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUserRole(uid: string): Promise<UserRole | null> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return userDoc.data() as UserRole;
      }
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  async listAllUsers(): Promise<UserRole[]> {
    try {
      const usersCol = collection(this.firestore, 'users') as CollectionReference<DocumentData>;
      const snapshot = await getDocs(usersCol);
      return snapshot.docs.map(doc => doc.data() as UserRole);
    } catch (error) {
      console.error('Error listing users:', error);
      return [];
    }
  }

  cleanup() {
    if ((this as any).unsubscribeRole) {
      (this as any).unsubscribeRole();
    }
  }
}
