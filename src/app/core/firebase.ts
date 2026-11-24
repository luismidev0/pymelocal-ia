import { FirebaseApp, initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebase.config';

/** Instancia de Firebase, o `null` si la app trabaja en modo local. */
export const fbApp: FirebaseApp | null = firebaseConfig ? initializeApp(firebaseConfig) : null;
