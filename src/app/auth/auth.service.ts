import { inject, signal, computed, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, User, GoogleAuthProvider } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  // Internal state
  private readonly userSignal = signal<User | null>(null);
  private readonly isLoadingSignal = signal<boolean>(true);

  // Public computed signals
  readonly user = computed(() => this.userSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly userDisplayName = computed(() => this.userSignal()?.displayName || this.userSignal()?.email || '');

  constructor() {
    onAuthStateChanged(this.auth, user => {
      this.userSignal.set(user);
      this.isLoadingSignal.set(false);
    });
  }

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

  logout() {
    return signOut(this.auth);
  }
}
