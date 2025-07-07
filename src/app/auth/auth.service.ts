import { inject, signal, computed, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, User, GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { TranslationService } from '../core/translation.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private translationService = inject(TranslationService);

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
  readonly userDisplayName = computed(() => this.userSignal()?.displayName || this.userSignal()?.email || '');
  readonly error = computed(() => this.errorSignal());

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    try {
      onAuthStateChanged(this.auth,
        (user) => {
          this.userSignal.set(user);
          this.isLoadingSignal.set(false);
          this.isInitializedSignal.set(true);
          this.errorSignal.set(null);

          // Restore user's language preference when user logs in
          if (user?.uid) {
            this.translationService.restoreUserLanguagePreference(user.uid);
          }
        },
        (error) => {
          this.errorSignal.set(error.message);
          this.isLoadingSignal.set(false);
          this.isInitializedSignal.set(true);
        }
      );
    } catch (error) {
      this.errorSignal.set('Error initializing authentication');
      this.isLoadingSignal.set(false);
      this.isInitializedSignal.set(true);
    }
  }

  // Authentication methods
  registre(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    return signInWithPopup(this.auth, provider);
  }

  async logout() {
    try {
      // Save current language preference before logout
      this.saveCurrentUserLanguage();
      await signOut(this.auth);
      // Redirect to login after logout
      this.router.navigate(['/login']);
    } catch (error) {
      throw error;
    }
  }

  // Guard methods
  canActivate(): boolean {
    return this.isAuthenticated();
  }

  // Method to save user's current language preference
  saveCurrentUserLanguage(): void {
    const currentUser = this.user();
    if (currentUser?.uid) {
      const currentLanguage = this.translationService.getLanguage();
      this.translationService.saveUserLanguagePreference(currentUser.uid, currentLanguage);
    }
  }

  // Method to clear error
  clearError(): void {
    this.errorSignal.set(null);
  }
}
