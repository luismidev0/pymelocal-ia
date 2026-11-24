import type { FirebaseOptions } from 'firebase/app';

/**
 * Configuración del proyecto de Firebase.
 *
 * Con esta constante en `null` la aplicación trabaja en modo local:
 * las cuentas se guardan en el dispositivo y los textos salen de un
 * generador de demostración. Al pegar aquí el bloque `firebaseConfig`
 * de la consola de Firebase, el inicio de sesión pasa a Firebase
 * Authentication y la generación de textos a Firebase AI Logic (Gemini).
 */
export const firebaseConfig: FirebaseOptions | null = null;

/** Modelo de IA generativa usado por Firebase AI Logic. */
export const MODELO_IA = 'gemini-2.5-flash';
