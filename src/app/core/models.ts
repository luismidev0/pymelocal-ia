export type Tono = 'Cercano' | 'Formal' | 'Divertido';
export type Red = 'Google Business' | 'Facebook';
export type TipoTexto = 'publicacion' | 'respuesta';

export interface Usuario {
  uid: string;
  nombre: string;
  correo: string;
}

export interface PerfilNegocio {
  nombre: string;
  tipo: string;
  ciudad: string;
  descripcion: string;
  tono: Tono;
}

/** Datos con los que se generó un texto; permiten pedir otra versión (RF8). */
export interface Contexto {
  tema?: string;
  resena?: string;
  estrellas?: number;
}

export interface Borrador {
  id: string;
  tipo: TipoTexto;
  red: Red;
  texto: string;
  contexto: Contexto;
  actualizado: string; // fecha ISO
}

export interface Publicacion {
  id: string;
  texto: string;
  red: Red;
  fecha: string; // fecha y hora ISO
  publicada: boolean;
  recordatorio: boolean;
  notificacionId: number;
}

export interface Preferencias {
  recordatorios: boolean;
  antelacionMin: number; // 0, 15 o 60 minutos antes
}

export const TIPOS_NEGOCIO = [
  'Restaurante', 'Cafetería', 'Panadería', 'Peluquería o barbería', 'Tienda de barrio',
  'Taller mecánico', 'Tienda de ropa', 'Veterinaria', 'Ferretería', 'Otro',
];
export const TONOS: Tono[] = ['Cercano', 'Formal', 'Divertido'];
export const REDES: Red[] = ['Google Business', 'Facebook'];

export const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
