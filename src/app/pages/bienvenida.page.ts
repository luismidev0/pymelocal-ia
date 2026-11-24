import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

/** Pantalla 01 · Bienvenida: punto de partida de la aplicación. */
@Component({
  selector: 'app-bienvenida',
  imports: [IonContent, IonButton, RouterLink],
  template: `
    <ion-content>
      <div class="caja">
        <div class="marca">
          <div class="logo" aria-hidden="true">PL</div>
          <h1>PymeLocal IA</h1>
          <div class="franja" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          <p class="pl-muted">Publicaciones y respuestas a reseñas para tu negocio, en segundos.</p>
        </div>
        <ul class="puntos">
          <li><b>Ideas de publicación</b> para Google Business y Facebook.</li>
          <li><b>Respuestas a reseñas</b> con el tono de tu negocio.</li>
          <li><b>Calendario</b> con recordatorios para publicar a tiempo.</li>
        </ul>
        <div class="acciones">
          <ion-button expand="block" routerLink="/registro">Crear cuenta</ion-button>
          <ion-button expand="block" fill="outline" routerLink="/iniciar-sesion">Ya tengo cuenta</ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .caja { min-height: 100%; display: flex; flex-direction: column; gap: 28px; padding: calc(56px + var(--ion-safe-area-top, 0px)) 24px calc(32px + var(--ion-safe-area-bottom, 0px)); }
    .marca { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
    .logo { width: 72px; height: 72px; border-radius: 18px; background: var(--ion-color-primary); color: #fff; font-size: 28px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .franja { display: flex; gap: 6px; }
    .franja span { width: 28px; height: 5px; border-radius: 3px; background: var(--ion-color-primary); }
    .franja span:nth-child(2) { background: var(--ion-color-danger); }
    .franja span:nth-child(3) { background: var(--ion-color-warning); }
    .franja span:nth-child(4) { background: var(--ion-color-success); }
    .marca p { max-width: 280px; font-size: 15px; }
    .puntos { margin: 0; padding: 18px 18px 18px 34px; background: var(--pl-fill); border-radius: 12px; display: flex; flex-direction: column; gap: 10px; font-size: 14px; line-height: 1.4; }
    .acciones { margin-top: auto; display: flex; flex-direction: column; gap: 12px; }
  `],
})
export class BienvenidaPage {}
