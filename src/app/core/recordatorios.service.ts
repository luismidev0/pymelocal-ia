import { Injectable, inject } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { DatosService } from './datos.service';
import { Publicacion } from './models';

/** RF17 y RF18: recordatorios con notificaciones locales del dispositivo. */
@Injectable({ providedIn: 'root' })
export class RecordatoriosService {
  private datos = inject(DatosService);

  /** Programa (o reprograma) la notificación de una publicación. Devuelve si quedó programada. */
  async programar(p: Publicacion): Promise<boolean> {
    await this.cancelar(p);
    const prefs = this.datos.preferencias();
    if (!p.recordatorio || !prefs.recordatorios || p.publicada) return false;
    const cuando = new Date(new Date(p.fecha).getTime() - prefs.antelacionMin * 60000);
    if (cuando.getTime() <= Date.now()) return false;
    try {
      let permiso = await LocalNotifications.checkPermissions();
      if (permiso.display !== 'granted') permiso = await LocalNotifications.requestPermissions();
      if (permiso.display !== 'granted') return false;
      await LocalNotifications.schedule({
        notifications: [{
          id: p.notificacionId,
          title: `Hora de publicar en ${p.red}`,
          body: p.texto.slice(0, 120),
          schedule: { at: cuando, allowWhileIdle: true },
        }],
      });
      return true;
    } catch {
      return false; // por ejemplo, en un navegador sin soporte de notificaciones
    }
  }

  async cancelar(p: Publicacion): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: p.notificacionId }] });
    } catch { /* sin soporte */ }
  }

  /** Aplica un cambio de preferencias a todas las publicaciones pendientes. */
  async reprogramarTodo(): Promise<void> {
    for (const p of this.datos.publicaciones()) await this.programar(p);
  }
}
