import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { Borrador, PerfilNegocio, Preferencias, Publicacion } from './models';
import { guardar, leer } from './storage';

/**
 * Datos del usuario guardados en el dispositivo: perfil del negocio (RF4, RF5),
 * borradores (RF12, RF13), publicaciones programadas (RF14 a RF16) y preferencias (RF18).
 */
@Injectable({ providedIn: 'root' })
export class DatosService {
  private auth = inject(AuthService);

  readonly perfil = signal<PerfilNegocio | null>(null);
  readonly borradores = signal<Borrador[]>([]);
  readonly publicaciones = signal<Publicacion[]>([]);
  readonly preferencias = signal<Preferencias>({ recordatorios: true, antelacionMin: 0 });
  private cargadoPara: string | null = null;

  private clave(nombre: string): string {
    return `pl_${nombre}_${this.auth.usuario()?.uid ?? 'anon'}`;
  }

  /** Carga los datos del usuario con sesión abierta (una vez por usuario). */
  async cargar(): Promise<void> {
    const uid = this.auth.usuario()?.uid ?? null;
    if (uid === this.cargadoPara) return;
    this.cargadoPara = uid;
    this.perfil.set(await leer<PerfilNegocio | null>(this.clave('perfil'), null));
    this.borradores.set(await leer<Borrador[]>(this.clave('borradores'), []));
    this.publicaciones.set(await leer<Publicacion[]>(this.clave('publicaciones'), []));
    this.preferencias.set(await leer<Preferencias>(this.clave('prefs'), { recordatorios: true, antelacionMin: 0 }));
  }

  async guardarPerfil(p: PerfilNegocio): Promise<void> {
    this.perfil.set(p);
    await guardar(this.clave('perfil'), p);
  }

  async guardarBorrador(b: Borrador): Promise<void> {
    const resto = this.borradores().filter((x) => x.id !== b.id);
    this.borradores.set([{ ...b, actualizado: new Date().toISOString() }, ...resto]);
    await guardar(this.clave('borradores'), this.borradores());
  }

  async eliminarBorrador(id: string): Promise<void> {
    this.borradores.set(this.borradores().filter((x) => x.id !== id));
    await guardar(this.clave('borradores'), this.borradores());
  }

  async guardarPublicacion(p: Publicacion): Promise<void> {
    const resto = this.publicaciones().filter((x) => x.id !== p.id);
    this.publicaciones.set([...resto, p].sort((a, b) => a.fecha.localeCompare(b.fecha)));
    await guardar(this.clave('publicaciones'), this.publicaciones());
  }

  async eliminarPublicacion(id: string): Promise<void> {
    this.publicaciones.set(this.publicaciones().filter((x) => x.id !== id));
    await guardar(this.clave('publicaciones'), this.publicaciones());
  }

  async guardarPreferencias(p: Preferencias): Promise<void> {
    this.preferencias.set(p);
    await guardar(this.clave('prefs'), p);
  }
}
