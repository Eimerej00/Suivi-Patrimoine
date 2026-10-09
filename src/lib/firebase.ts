import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

// Try loading optional config file if present, but fallback to environment variables
let config: any = {};
try {
  // @ts-ignore
  config = await import('../../firebase-applet-config.json');
} catch {
  config = {};
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || config.default?.apiKey || config.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || config.default?.authDomain || config.authDomain || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || config.default?.projectId || config.projectId || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || config.default?.storageBucket || config.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || config.default?.messagingSenderId || config.messagingSenderId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || config.default?.appId || config.appId || '',
  databaseURL: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || config.default?.firestoreDatabaseId || config.firestoreDatabaseId || ''
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const dbId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || config.default?.firestoreDatabaseId || config.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, dbId);
export const googleProvider = new GoogleAuthProvider();

export const ALLOWED_EMAIL = 'jeremie.lecorney@gmail.com';

export { signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, onSnapshot };
export type { User };
