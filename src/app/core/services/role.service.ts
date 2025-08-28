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


export interface UserRole {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  lang: string;
  role: 'client' | 'admin';
  theme: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  /**
   * Check if Firestore is properly initialized
   */
  private isFirestoreReady(): boolean {
    return this.firestore && typeof this.firestore === 'object';
  }

  /**
   * Wait for Firestore to be ready with timeout
   */
  private async waitForFirestoreReady(timeoutMs: number = 5000): Promise<void> {
    const startTime = Date.now();
    while (!this.isFirestoreReady()) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error('Firestore initialization timeout');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Internal state
  private readonly userRoleSignal = signal<UserRole | null>(null);
  private readonly isLoadingRoleSignal = signal<boolean>(true);
  private unsubscribeRole?: () => void;

  // Public computed signals
  readonly userRole = computed(() => this.userRoleSignal());
  readonly isLoadingRole = computed(() => this.isLoadingRoleSignal());
  readonly isClient = computed(() => this.userRoleSignal()?.role === 'client');
  readonly isAdmin = computed(() => this.userRoleSignal()?.role === 'admin');

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

      // Wait for Firestore to be ready
      await this.waitForFirestoreReady();

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
      this.unsubscribeRole = unsubscribe;
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
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
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
      // Wait for Firestore to be ready
      await this.waitForFirestoreReady();
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
      // Wait for Firestore to be ready
      await this.waitForFirestoreReady();
      const userDocRef = doc(this.firestore, 'users', uid);
      await updateDoc(userDocRef, updates);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      // Wait for Firestore to be ready
      await this.waitForFirestoreReady();
      const userDocRef = doc(this.firestore, 'users', uid);
      await deleteDoc(userDocRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUserRole(uid: string): Promise<UserRole | null> {
    try {
      // Wait for Firestore to be ready
      await this.waitForFirestoreReady();
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

  async getUserProfilePhoto(uid: string): Promise<string | null> {
    try {
      const userRole = await this.getUserRole(uid);
      return userRole?.photoURL || null;
    } catch (error) {
      console.error('Error getting user profile photo:', error);
      return null;
    }
  }

  async listAllUsers(): Promise<UserRole[]> {
    try {
      // Wait for Firestore to be ready
      await this.waitForFirestoreReady();

      const usersCol = collection(this.firestore, 'users') as CollectionReference<DocumentData>;
      const snapshot = await getDocs(usersCol);
      return snapshot.docs.map(doc => doc.data() as UserRole);
    } catch (error) {
      console.error('Error listing users:', error);
      return [];
    }
  }

  cleanup() {
    if (this.unsubscribeRole) {
      this.unsubscribeRole();
    }
  }
}
