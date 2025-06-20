import { initializeApp } from '@angular/fire/app';
import { getAuth, GoogleAuthProvider } from '@angular/fire/auth';
import { environment } from '../../environments/environment';

// Initialize Firebase
export const app = initializeApp(environment.firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
