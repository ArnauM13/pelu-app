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

  // Public computed signals
  readonly user = computed(() => this.userSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly isInitialized = computed(() => this.isInitializedSignal());
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly userDisplayName = computed(() => this.userSignal()?.displayName || this.userSignal()?.email || '');

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    onAuthStateChanged(this.auth, user => {
      this.userSignal.set(user);
      this.isLoadingSignal.set(false);
      this.isInitializedSignal.set(true);

      // Restore user's language preference when user logs in
      if (user?.uid) {
        this.translationService.restoreUserLanguagePreference(user.uid);
      }
    });
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
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al tancar sessió:', error);
      throw error;
    }
  }

  // Navigation methods
  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  redirectToHome() {
    this.router.navigate(['/']);
  }

  // Guard methods
  canActivate(): boolean {
    return this.isAuthenticated();
  }

  canActivateAsync(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isInitialized()) {
        const isAuth = this.isAuthenticated();
        if (!isAuth) {
          this.redirectToLogin();
        }
        resolve(isAuth);
      } else {
        // Wait for initialization
        const unsubscribe = this.auth.onAuthStateChanged((user) => {
          unsubscribe();
          const isAuth = !!user;
          if (!isAuth) {
            this.redirectToLogin();
          }
          resolve(isAuth);
        });
      }
    });
  }

  // Method to save user's current language preference
  saveCurrentUserLanguage(): void {
    const currentUser = this.user();
    if (currentUser?.uid) {
      const currentLanguage = this.translationService.getLanguage();
      this.translationService.saveUserLanguagePreference(currentUser.uid, currentLanguage);
    }
  }
}
