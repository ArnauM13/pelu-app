import { inject, Injectable, signal, computed, effect } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { RoleService, UserRole } from './role.service';
import { User } from '@angular/fire/auth';

export interface UserProfile {
  auth: User | null;
  role: UserRole | null;
  isLoading: boolean;
  isInitialized: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private authService = inject(AuthService);
  private roleService = inject(RoleService);

  // Internal state
  private readonly userProfileSignal = signal<UserProfile>({
    auth: null,
    role: null,
    isLoading: true,
    isInitialized: false,
  });

  // Public computed signals
  readonly userProfile = computed(() => this.userProfileSignal());
  readonly currentUser = computed(() => this.userProfileSignal().auth);
  readonly currentRole = computed(() => this.userProfileSignal().role);
  readonly isLoading = computed(() => this.userProfileSignal().isLoading);
  readonly isInitialized = computed(() => this.userProfileSignal().isInitialized);

  // Authentication state
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userDisplayName = computed(
    () => this.currentUser()?.displayName || this.currentUser()?.email || ''
  );
  readonly userEmail = computed(() => this.currentUser()?.email || '');
  readonly userId = computed(() => this.currentUser()?.uid || null);

  // Role-based computed signals (unified from both services)
  readonly isClient = computed(() => this.currentRole()?.role === 'client');
  readonly isAdmin = computed(() => this.currentRole()?.role === 'admin');
  readonly hasAdminAccess = computed(() => this.currentRole()?.role === 'admin');

  // Permission-based computed signals (unified from both services)
  readonly canManageUsers = computed(() => this.currentRole()?.role === 'admin');
  readonly canViewAllAppointments = computed(() => this.currentRole()?.role === 'admin');

  // Error handling
  readonly error = computed(() => this.authService.error());

  constructor() {
    this.initializeUserProfile();
  }

  private initializeUserProfile() {
    // Use effect to react to changes in auth and role signals
    effect(
      () => {
        const auth = this.authService.user();
        const role = this.roleService.userRole();
        const authLoading = this.authService.isLoading();
        const roleLoading = this.roleService.isLoadingRole();
        const authInitialized = this.authService.isInitialized();

        this.userProfileSignal.set({
          auth,
          role,
          isLoading: authLoading || roleLoading,
          isInitialized: authInitialized && !roleLoading,
        });
      }
    );
  }

  // Authentication methods (delegated to AuthService)
  async register(email: string, password: string) {
    return this.authService.registre(email, password);
  }

  async login(email: string, password: string) {
    return this.authService.login(email, password);
  }

  async loginWithGoogle() {
    return this.authService.loginWithGoogle();
  }

  async logout() {
    return this.authService.logout();
  }

  // Role management methods (delegated to RoleService)
  async updateUserRole(uid: string, updates: Partial<UserRole>) {
    return this.roleService.updateUserRole(uid, updates);
  }

  async promoteToAdmin(uid: string, adminInfo?: Partial<UserRole>) {
    const updates: Partial<UserRole> = {
      role: 'admin',
      ...adminInfo,
    };
    return this.roleService.updateUserRole(uid, updates);
  }

  async demoteToClient(uid: string) {
    const updates: Partial<UserRole> = {
      role: 'client',
    };
    return this.roleService.updateUserRole(uid, updates);
  }

  async getUserRole(uid: string) {
    return this.roleService.getUserRole(uid);
  }

  async listAllUsers() {
    return this.roleService.listAllUsers();
  }

  async deleteUser(uid: string) {
    return this.roleService.deleteUser(uid);
  }

  // Utility methods
  clearError() {
    this.authService.clearError();
  }

  // Guard methods
  canActivate(): boolean {
    return this.authService.canActivate();
  }

  // Method to check if user has specific permission
  hasPermission(_permission: string): boolean {
    const role = this.currentRole();
    if (!role || role.role !== 'admin') {
      return false;
    }

    // For now, all admins have all permissions
    return true;
  }

  // Method to check if user can access admin features
  canAccessAdminFeatures(): boolean {
    return this.hasAdminAccess();
  }

  // Method to get user's full profile
  getUserFullProfile(): UserProfile {
    return this.userProfile();
  }

  // Cleanup method
  cleanup() {
    this.roleService.cleanup();
  }
}
