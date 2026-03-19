import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env
    .VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Realtime Database
export const db = getDatabase(app);

// Initialize Storage
export const storage = getStorage(app);

const allowedDomains = [
  '@dataiq.com',
  '@dataiq.com.ar',
  '@dataiq.com.cl',
  '@dataiq.com.uy',
  '@dataiq-latam.com',
];

export const isEmailAllowed = (email: string): boolean =>
  allowedDomains.some((domain) => email.toLowerCase().endsWith(domain));

export class UnauthorizedDomainError extends Error {
  constructor() {
    super('Tu cuenta no tiene acceso a esta aplicación.');
    this.name = 'UnauthorizedDomainError';
  }
}

export const signInWithDomainCheck = async (): Promise<void> => {
  const result = await signInWithPopup(auth, googleProvider);
  const email = result.user.email ?? '';
  if (!isEmailAllowed(email)) {
    await signOut(auth);
    throw new UnauthorizedDomainError();
  }
};

export default app;
