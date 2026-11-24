import { Preferences } from '@capacitor/preferences';

/** Almacenamiento en el dispositivo (RNF2): la app funciona sin conexión. */
export async function leer<T>(clave: string, porDefecto: T): Promise<T> {
  const { value } = await Preferences.get({ key: clave });
  if (!value) return porDefecto;
  try {
    return JSON.parse(value) as T;
  } catch {
    return porDefecto;
  }
}

export async function guardar(clave: string, valor: unknown): Promise<void> {
  await Preferences.set({ key: clave, value: JSON.stringify(valor) });
}

export async function borrar(clave: string): Promise<void> {
  await Preferences.remove({ key: clave });
}
