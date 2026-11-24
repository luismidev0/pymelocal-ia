import { Injectable, signal } from '@angular/core';
import { Borrador, Publicacion } from './models';

/** Texto que el usuario lleva de una pantalla a otra (generar → editor → programar). */
@Injectable({ providedIn: 'root' })
export class SesionTrabajoService {
  readonly enEdicion = signal<Borrador | null>(null);
  readonly porProgramar = signal<Partial<Publicacion> | null>(null);
}
