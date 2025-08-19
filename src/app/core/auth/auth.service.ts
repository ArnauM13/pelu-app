import { inject, signal, computed, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { TranslationService } from '../services/translation.service';
import { RoleService, UserRole } from '../services/role.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private roleService = inject(RoleService);

  // Internal state
  private readonly userSignal = signal<User | null>(null);
  private readonly isLoadingSignal = signal<boolean>(true);
  private readonly isInitializedSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Public computed signals
  readonly user = computed(() => this.userSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly isInitialized = computed(() => this.isInitializedSignal());
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly userDisplayName = computed(
    () => this.userSignal()?.displayName || this.userSignal()?.email || ''
  );
  readonly error = computed(() => this.errorSignal());

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    try {
      onAuthStateChanged(
        this.auth,
        async user => {
          // Use setTimeout to avoid signal write conflicts
          setTimeout(() => {
            this.userSignal.set(user);
            this.isLoadingSignal.set(false);
            this.isInitializedSignal.set(true);
            this.errorSignal.set(null);
          }, 0);

          // Restore user's language preference when user logs in
          if (user?.uid) {
            this.translationService.restoreUserLanguagePreference(user.uid);
            // Assegura que el document d'usuari existeix i està actualitzat
            await this.ensureUserDocument(user);
          }
        },
        error => {
          // Use setTimeout to avoid signal write conflicts
          setTimeout(() => {
            this.errorSignal.set(error.message);
            this.isLoadingSignal.set(false);
            this.isInitializedSignal.set(true);
          }, 0);
        }
      );
    } catch (error: unknown) {
      // Use setTimeout to avoid signal write conflicts
      setTimeout(() => {
        this.errorSignal.set(error instanceof Error ? error.message : 'Error initializing authentication');
        this.isLoadingSignal.set(false);
        this.isInitializedSignal.set(true);
      }, 0);
    }
  }

  // Authentication methods
  async registre(email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    // Inicialitza el document d'usuari a Firestore
    const browserLanguage = this.translationService.getBrowserLanguage() || 'ca';
    await this.roleService.setUserRole({
      uid: cred.user.uid,
      email: cred.user.email || '',
      lang: browserLanguage,
      role: 'client',
      theme: 'light',
    });
    return cred;
  }

  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    // Assegura que el document d'usuari existeix i està actualitzat
    await this.ensureUserDocument(cred.user);
    return cred;
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });
    const cred = await signInWithPopup(this.auth, provider);
    // Assegura que el document d'usuari existeix i està actualitzat
    await this.ensureUserDocument(cred.user);
    return cred;
  }

  async ensureUserDocument(user: User) {
    if (!user) return;
    // Si el document no existeix, el crea. Si existeix, l'actualitza amb email/lang/theme si cal.
    const existing = await this.roleService.getUserRole(user.uid);
    const update: Partial<UserRole> = {
      email: user.email || '',
      uid: user.uid,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
    };
    if (!existing) {
      const browserLanguage = this.translationService.getBrowserLanguage() || 'ca';
      await this.roleService.setUserRole({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
        lang: browserLanguage,
        role: 'client',
        theme: 'light',
      });
    } else {
      // Actualitza si canvia l'email, displayName o photoURL
      const hasChanges = existing.email !== update.email ||
                        existing.displayName !== update.displayName ||
                        existing.photoURL !== update.photoURL;
      if (hasChanges) {
        await this.roleService.updateUserRole(user.uid, update);
      }
    }
  }

  async logout() {
    this.saveCurrentUserLanguage();
    await signOut(this.auth);
    // Wait for the auth state to be updated
    await this.waitForAuthStateUpdate();
    this.router.navigate(['/login']);
  }

  private async waitForAuthStateUpdate(): Promise<void> {
    return new Promise(resolve => {
      // If already not authenticated, resolve immediately
      if (!this.isAuthenticated()) {
        resolve();
        return;
      }

      // Wait for auth state to change
      const checkAuthState = () => {
        if (!this.isAuthenticated()) {
          resolve();
        } else {
          setTimeout(checkAuthState, 50);
        }
      };

      setTimeout(checkAuthState, 50);
    });
  }

  canActivate(): boolean {
    return this.isAuthenticated();
  }

  saveCurrentUserLanguage(): void {
    const currentUser = this.user();
    if (currentUser?.uid) {
      const currentLanguage = this.translationService.getLanguage();
      this.translationService.saveUserLanguagePreference(currentUser.uid, currentLanguage);
    }
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
