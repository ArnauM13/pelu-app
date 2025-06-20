import { inject, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';

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

  logout() {
    return signOut(this.auth);
  }
}
