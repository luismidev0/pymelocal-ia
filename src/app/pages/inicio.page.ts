import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { DatosService } from '../core/datos.service';
import { IaService } from '../core/ia.service';

/** Pantalla 05 · Inicio: acceso a las dos tareas principales (RF6 y RF7). */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink, DatePipe, IonContent, IonIcon],
  template: `
    <ion-content>
      <div class="pl-page">
        <div>
          <span class="pl-muted">Hola,</span>
          <h1>{{ datos.perfil()?.nombre }}</h1>
        </div>
        @if (ia.modo === 'demo') {
          <div class="pl-demo">Modo de demostración: los textos se arman con plantillas en el dispositivo, sin conexión a la IA.</div>
        }
        <h2 class="pl-h2">¿Qué necesitas hoy?</h2>
        <a class="accion" routerLink="/generar-publicacion">
          <span class="icono azul"><ion-icon name="sparkles-outline" aria-hidden="true"></ion-icon></span>
          <span class="texto"><b>Generar publicación</b><small>Ideas para Google Business y Facebook</small></span>
          <ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon>
        </a>
        <a class="accion" routerLink="/responder-resena">
          <span class="icono verde"><ion-icon name="chatbox-ellipses-outline" aria-hidden="true"></ion-icon></span>
          <span class="texto"><b>Responder reseña</b><small>Un borrador con el tono de tu negocio</small></span>
          <ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon>
        </a>
        <div class="fila">
          <h2 class="pl-h2">Próximas publicaciones</h2>
          <a class="enlace" routerLink="/tabs/calendario">Ver calendario</a>
        </div>
        @for (p of proximas(); track p.id) {
          <div class="pub">
            <div class="fecha" [class.fb]="p.red === 'Facebook'"><b>{{ p.fecha | date: 'd' }}</b><small>{{ p.fecha | date: 'MMM' }}</small></div>
            <div class="cuerpo">
              <p>{{ p.texto }}</p>
              <div><span class="pl-tag">{{ p.red }}</span> <small>{{ p.fecha | date: 'h:mm a' }}</small></div>
            </div>
          </div>
        } @empty {
          <p class="pl-muted">Todavía no tienes publicaciones programadas. Genera una idea y prográmala desde el editor.</p>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    h1 { margin: 2px 0 0; font-size: 24px; font-weight: 700; }
    .accion { display: flex; align-items: center; gap: 14px; min-height: 84px; padding: 16px; border: 1.5px solid var(--pl-line); border-radius: 12px; color: var(--ion-text-color); text-decoration: none; }
    .accion > ion-icon { color: var(--ion-color-medium); font-size: 20px; }
    .icono { flex: none; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .icono.azul { background: var(--pl-blue-tint); color: var(--ion-color-primary); }
    .icono.verde { background: var(--pl-green-tint); color: var(--ion-color-success); }
    .texto { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .texto b { font-size: 16px; font-weight: 600; }
    .texto small { font-size: 13px; color: var(--ion-color-medium); }
    .fila { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
    .enlace { color: var(--ion-color-primary); font-size: 14px; font-weight: 600; text-decoration: none; min-height: 44px; display: inline-flex; align-items: center; }
    .pub { display: flex; gap: 12px; align-items: center; border: 1.5px solid var(--pl-line); border-radius: 12px; padding: 10px 12px; }
    .fecha { flex: none; width: 46px; height: 50px; border-radius: 8px; background: var(--pl-blue-tint); color: var(--ion-color-primary); display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .fecha.fb { background: var(--pl-yellow-tint); color: #8a5a00; }
    .fecha b { font-size: 17px; line-height: 1; } .fecha small { font-size: 12px; }
    .cuerpo { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
    .cuerpo p { margin: 0; font-size: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .cuerpo small { font-size: 12px; color: var(--ion-color-medium); }
  `],
})
export class InicioPage {
  datos = inject(DatosService);
  ia = inject(IaService);
  proximas = computed(() => {
    const ahora = new Date().toISOString();
    return this.datos.publicaciones().filter((p) => !p.publicada && p.fecha >= ahora).slice(0, 2);
  });
}
