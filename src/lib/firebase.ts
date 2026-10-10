import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

declare const __FIREBASE_DEFAULTS__: {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  databaseId?: string;
};

const defaults = typeof __FIREBASE_DEFAULTS__ !== 'undefined' ? __FIREBASE_DEFAULTS__ : {};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaults.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaults.authDomain || 'temporal-charge-thl8x.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaults.projectId || 'temporal-charge-thl8x',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaults.storageBucket || 'temporal-charge-thl8x.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaults.messagingSenderId || '660117405427',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaults.appId || '1:660117405427:web:069094c7c60e7fdebe8186',
  databaseURL: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || defaults.databaseId || 'ai-studio-3bcb2e47-829c-4de3-9232-9495856b0309'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const dbId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || defaults.databaseId || 'ai-studio-3bcb2e47-829c-4de3-9232-9495856b0309';
export const db = getFirestore(app, dbId);
export const googleProvider = new GoogleAuthProvider();

export const ALLOWED_EMAIL = 'jeremie.lecorney@gmail.com';

export { signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, onSnapshot };
export type { User };
