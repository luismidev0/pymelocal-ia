import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  Auth, browserLocalPersistence, createUserWithEmailAndPassword, indexedDBLocalPersistence,
  initializeAuth, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword,
  signOut, updateProfile,
} from 'firebase/auth';
import { fbApp } from './firebase';
import { Usuario, nuevoId } from './models';
import { borrar, guardar, leer } from './storage';

interface CuentaLocal extends Usuario { sal: string; hash: string; }

const CUENTAS = 'pl_cuentas';
const SESION = 'pl_sesion';

/** RF1, RF2 y RF3: registro, inicio y cierre de sesión. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly usuario = signal<Usuario | null>(null);
  readonly modo: 'firebase' | 'local' = fbApp ? 'firebase' : 'local';
  readonly listo: Promise<void>;
  private auth?: Auth;

  constructor() {
    this.listo = this.iniciar();
  }

  private async iniciar(): Promise<void> {
    if (fbApp) {
      this.auth = initializeAuth(fbApp, {
        persistence: Capacitor.isNativePlatform() ? indexedDBLocalPersistence : browserLocalPersistence,
      });
      await new Promise<void>((resolver) => {
        onAuthStateChanged(this.auth!, (u) => {
          this.usuario.set(u ? { uid: u.uid, nombre: u.displayName ?? '', correo: u.email ?? '' } : null);
          resolver();
        });
      });
      return;
    }
    this.usuario.set(await leer<Usuario | null>(SESION, null));
  }

  async registrar(nombre: string, correo: string, clave: string): Promise<void> {
    correo = correo.trim().toLowerCase();
    if (this.auth) {
      try {
        const cred = await createUserWithEmailAndPassword(this.auth, correo, clave);
        await updateProfile(cred.user, { displayName: nombre });
        this.usuario.set({ uid: cred.user.uid, nombre, correo });
      } catch (e) {
        throw new Error(this.traducir(e));
      }
      return;
    }
    const cuentas = await leer<CuentaLocal[]>(CUENTAS, []);
    if (cuentas.some((c) => c.correo === correo)) throw new Error('Ya existe una cuenta con ese correo.');
    const sal = nuevoId();
    const cuenta: CuentaLocal = { uid: nuevoId(), nombre, correo, sal, hash: await this.hash(sal, clave) };
    await guardar(CUENTAS, [...cuentas, cuenta]);
    await this.abrirSesionLocal(cuenta);
  }

  async iniciarSesion(correo: string, clave: string): Promise<void> {
    correo = correo.trim().toLowerCase();
    if (this.auth) {
      try {
        const cred = await signInWithEmailAndPassword(this.auth, correo, clave);
        this.usuario.set({ uid: cred.user.uid, nombre: cred.user.displayName ?? '', correo });
      } catch (e) {
        throw new Error(this.traducir(e));
      }
      return;
    }
    const cuentas = await leer<CuentaLocal[]>(CUENTAS, []);
    const cuenta = cuentas.find((c) => c.correo === correo);
    if (!cuenta || cuenta.hash !== (await this.hash(cuenta.sal, clave))) {
      throw new Error('El correo o la contraseña no coinciden.');
    }
    await this.abrirSesionLocal(cuenta);
  }

  async cerrarSesion(): Promise<void> {
    if (this.auth) await signOut(this.auth);
    else await borrar(SESION);
    this.usuario.set(null);
  }

  /** Devuelve el mensaje que se le muestra al usuario. */
  async recuperarClave(correo: string): Promise<string> {
    if (!this.auth) return 'En este dispositivo las cuentas se guardan sin conexión; la recuperación por correo se activa con Firebase.';
    if (!correo.trim()) return 'Escribe tu correo y vuelve a tocar el enlace.';
    try {
      await sendPasswordResetEmail(this.auth, correo.trim().toLowerCase());
      return 'Te enviamos un correo para cambiar la contraseña.';
    } catch (e) {
      return this.traducir(e);
    }
  }

  private async abrirSesionLocal(c: CuentaLocal): Promise<void> {
    const usuario: Usuario = { uid: c.uid, nombre: c.nombre, correo: c.correo };
    await guardar(SESION, usuario);
    this.usuario.set(usuario);
  }

  private async hash(sal: string, clave: string): Promise<string> {
    const datos = new TextEncoder().encode(`${sal}:${clave}`);
    const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', datos));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  private traducir(e: unknown): string {
    const codigo = (e as { code?: string })?.code ?? '';
    const mensajes: Record<string, string> = {
      'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
      'auth/invalid-email': 'El correo no es válido.',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
      'auth/invalid-credential': 'El correo o la contraseña no coinciden.',
      'auth/user-not-found': 'El correo o la contraseña no coinciden.',
      'auth/wrong-password': 'El correo o la contraseña no coinciden.',
      'auth/too-many-requests': 'Demasiados intentos. Espera un momento y vuelve a probar.',
      'auth/network-request-failed': 'No hay conexión a internet. Revisa la red y vuelve a intentar.',
    };
    return mensajes[codigo] ?? 'No se pudo completar la operación. Intenta de nuevo.';
  }
}
