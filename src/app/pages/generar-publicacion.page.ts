import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonSpinner,
  IonTitle, IonToolbar, ToastController,
} from '@ionic/angular/standalone';
import { avisar } from '../core/avisos';
import { DatosService } from '../core/datos.service';
import { IaService } from '../core/ia.service';
import { REDES, Red, nuevoId } from '../core/models';
import { SesionTrabajoService } from '../core/sesion-trabajo.service';

/** Pantalla 06 · Generar publicación (RF6 y RF8). */
@Component({
  selector: 'app-generar-publicacion',
  imports: [FormsModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonInput, IonButton, IonIcon, IonSpinner],
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/inicio" text=""></ion-back-button></ion-buttons>
      <ion-title>Generar publicación</ion-title>
    </ion-toolbar></ion-header>
    <ion-content>
      <div class="pl-page">
        <div>
          <span class="pl-label">¿Dónde vas a publicar?</span>
          <div class="pl-chips" role="group" aria-label="Red social">
            @for (r of redes; track r) {
              <button type="button" class="pl-chip" [class.on]="red === r" [attr.aria-pressed]="red === r" (click)="red = r">{{ r }}</button>
            }
          </div>
        </div>
        <ion-input class="pl-in" fill="outline" label="Tema (opcional)" labelPlacement="stacked"
          placeholder="Ej.: promoción de fin de semana" [(ngModel)]="tema"></ion-input>
        <ion-button expand="block" (click)="generar()" [disabled]="cargando()">
          @if (cargando()) { <ion-spinner name="crescent"></ion-spinner> }
          @else { <ion-icon slot="start" name="sparkles-outline"></ion-icon> {{ ideas().length ? 'Generar otras' : 'Generar ideas' }} }
        </ion-button>
        @if (error()) {
          <div class="pl-card error"><p class="pl-muted">{{ error() }}</p><ion-button fill="outline" size="small" (click)="generar()">Reintentar</ion-button></div>
        }
        @if (ideas().length) { <h2 class="pl-h2">{{ ideas().length }} ideas para tu negocio</h2> }
        @for (idea of ideas(); track $index) {
          <div class="pl-card idea">
            <p class="pl-text">{{ idea }}</p>
            <ion-button fill="outline" size="small" (click)="usar(idea)">Usar esta idea</ion-button>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`.idea, .error { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; } .idea p, .error p { align-self: stretch; } .error { border-color: var(--ion-color-danger); }`],
})
export class GenerarPublicacionPage {
  private ia = inject(IaService);
  private datos = inject(DatosService);
  private trabajo = inject(SesionTrabajoService);
  private router = inject(Router);
  private toast = inject(ToastController);
  redes = REDES;
  red: Red = 'Google Business';
  tema = '';
  ideas = signal<string[]>([]);
  cargando = signal(false);
  error = signal('');

  async generar() {
    this.cargando.set(true);
    this.error.set('');
    try {
      this.ideas.set(await this.ia.generarIdeas(this.datos.perfil()!, this.red, this.tema));
    } catch {
      // RNF9: mensaje claro y opción de reintentar sin perder lo escrito
      this.error.set('No se pudieron generar las ideas. Revisa tu conexión a internet y vuelve a intentar.');
      await avisar(this.toast, 'No se pudo conectar con la IA.', 'danger');
    } finally {
      this.cargando.set(false);
    }
  }

  usar(texto: string) {
    this.trabajo.enEdicion.set({
      id: nuevoId(), tipo: 'publicacion', red: this.red, texto,
      contexto: { tema: this.tema }, actualizado: new Date().toISOString(),
    });
    this.router.navigateByUrl('/editor');
  }
}
