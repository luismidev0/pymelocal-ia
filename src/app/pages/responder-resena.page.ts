import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonSpinner, IonTextarea,
  IonTitle, IonToolbar, ToastController,
} from '@ionic/angular/standalone';
import { avisar } from '../core/avisos';
import { DatosService } from '../core/datos.service';
import { IaService } from '../core/ia.service';
import { nuevoId } from '../core/models';
import { SesionTrabajoService } from '../core/sesion-trabajo.service';

/** Pantalla 07 · Responder reseña (RF7 y RF8). */
@Component({
  selector: 'app-responder-resena',
  imports: [FormsModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonTextarea, IonButton, IonIcon, IonSpinner],
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/inicio" text=""></ion-back-button></ion-buttons>
      <ion-title>Responder reseña</ion-title>
    </ion-toolbar></ion-header>
    <ion-content>
      <div class="pl-page">
        <ion-textarea class="pl-in" fill="outline" label="Reseña del cliente" labelPlacement="stacked" [rows]="4"
          placeholder="Pega aquí el texto de la reseña" [(ngModel)]="resena"></ion-textarea>
        <div>
          <span class="pl-label">Calificación</span>
          <div class="estrellas" role="group" aria-label="Calificación de la reseña">
            @for (n of [1, 2, 3, 4, 5]; track n) {
              <button type="button" [attr.aria-label]="n + ' estrellas'" [attr.aria-pressed]="estrellas === n" (click)="estrellas = n">
                <ion-icon [name]="n <= estrellas ? 'star' : 'star-outline'" aria-hidden="true"></ion-icon>
              </button>
            }
          </div>
        </div>
        <p class="pl-muted">Tono de la respuesta: <span class="pl-tag">{{ datos.perfil()?.tono }}</span></p>
        <ion-button expand="block" (click)="generar()" [disabled]="cargando()">
          @if (cargando()) { <ion-spinner name="crescent"></ion-spinner> }
          @else { <ion-icon slot="start" name="sparkles-outline"></ion-icon> Generar respuesta }
        </ion-button>
        @if (error()) {
          <div class="pl-card error"><p class="pl-muted">{{ error() }}</p><ion-button fill="outline" size="small" (click)="generar()">Reintentar</ion-button></div>
        }
        @if (respuesta()) {
          <h2 class="pl-h2">Borrador de respuesta</h2>
          <div class="pl-card"><p class="pl-text">{{ respuesta() }}</p></div>
          <div class="pl-row">
            <ion-button fill="outline" (click)="generar()" [disabled]="cargando()"><ion-icon slot="start" name="refresh-outline"></ion-icon>Generar otra</ion-button>
            <ion-button (click)="usar()">Editar y usar</ion-button>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .estrellas { display: flex; gap: 2px; margin-left: -8px; }
    .estrellas button { width: 44px; height: 44px; border: none; background: none; padding: 0; color: var(--ion-color-warning); font-size: 28px; }
    .error { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; border-color: var(--ion-color-danger); } .error p { align-self: stretch; }
  `],
})
export class ResponderResenaPage {
  private ia = inject(IaService);
  datos = inject(DatosService);
  private trabajo = inject(SesionTrabajoService);
  private router = inject(Router);
  private toast = inject(ToastController);
  resena = '';
  estrellas = 5;
  respuesta = signal('');
  cargando = signal(false);
  error = signal('');

  async generar() {
    if (this.resena.trim().length < 3) return avisar(this.toast, 'Pega primero el texto de la reseña.', 'danger');
    this.cargando.set(true);
    this.error.set('');
    try {
      this.respuesta.set(await this.ia.generarRespuesta(this.datos.perfil()!, this.resena, this.estrellas));
    } catch {
      this.error.set('No se pudo generar la respuesta. Revisa tu conexión a internet y vuelve a intentar.');
      await avisar(this.toast, 'No se pudo conectar con la IA.', 'danger');
    } finally {
      this.cargando.set(false);
    }
  }

  usar() {
    this.trabajo.enEdicion.set({
      id: nuevoId(), tipo: 'respuesta', red: 'Google Business', texto: this.respuesta(),
      contexto: { resena: this.resena, estrellas: this.estrellas }, actualizado: new Date().toISOString(),
    });
    this.router.navigateByUrl('/editor');
  }
}
