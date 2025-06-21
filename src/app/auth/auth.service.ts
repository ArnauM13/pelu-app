import { inject, signal, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, User, GoogleAuthProvider } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  user = signal<User | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, user => this.user.set(user));
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
