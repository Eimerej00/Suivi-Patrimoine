import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  databaseURL: config.firestoreDatabaseId
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Use custom database ID if specified in config
export const db = getFirestore(app, config.firestoreDatabaseId || '(default)');
export const googleProvider = new GoogleAuthProvider();

export const ALLOWED_EMAIL = 'jeremie.lecorney@gmail.com';

export { signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, onSnapshot };
export type { User };
