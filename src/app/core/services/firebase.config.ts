import { initializeApp } from '@angular/fire/app';
import { getAuth, GoogleAuthProvider } from '@angular/fire/auth';
import { getFirestore } from '@angular/fire/firestore';
import { getStorage } from '@angular/fire/storage';
import { environment } from '../../../environments/environment';

// Initialize Firebase
export const app = initializeApp(environment.firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firebase Firestore
export const firestore = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);
