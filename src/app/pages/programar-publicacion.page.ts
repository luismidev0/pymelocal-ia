import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonTextarea, IonTitle,
  IonToggle, IonToolbar, ToastController,
} from '@ionic/angular/standalone';
import { avisar } from '../core/avisos';
import { DatosService } from '../core/datos.service';
import { Publicacion, REDES, Red, nuevoId } from '../core/models';
import { RecordatoriosService } from '../core/recordatorios.service';
import { SesionTrabajoService } from '../core/sesion-trabajo.service';

const dos = (n: number) => String(n).padStart(2, '0');

/** Pantalla 09 · Programar publicación (RF14 y RF17). */
@Component({
  selector: 'app-programar-publicacion',
  imports: [FormsModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonInput, IonTextarea, IonToggle, IonButton],
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/calendario" text=""></ion-back-button></ion-buttons>
      <ion-title>Programar publicación</ion-title>
    </ion-toolbar></ion-header>
    <ion-content>
      <div class="pl-page">
        <ion-textarea class="pl-in" fill="outline" label="Publicación" labelPlacement="stacked" [rows]="4" [autoGrow]="true"
          placeholder="Escribe o pega el texto que vas a publicar" [(ngModel)]="texto"></ion-textarea>
        <div>
          <span class="pl-label">Red</span>
          <div class="pl-chips" role="group" aria-label="Red social">
            @for (r of redes; track r) {
              <button type="button" class="pl-chip" [class.on]="red === r" [attr.aria-pressed]="red === r" (click)="red = r">{{ r }}</button>
            }
          </div>
        </div>
        <div class="pl-row">
          <ion-input class="pl-in" fill="outline" label="Fecha" labelPlacement="stacked" type="date" [min]="hoy" [(ngModel)]="fecha"></ion-input>
          <ion-input class="pl-in" fill="outline" label="Hora" labelPlacement="stacked" type="time" [(ngModel)]="hora"></ion-input>
        </div>
        <ion-toggle [(ngModel)]="recordatorio" justify="space-between">Recordarme con una notificación</ion-toggle>
        @if (!datos.preferencias().recordatorios) {
          <p class="pl-muted">Los recordatorios están desactivados en Ajustes; esta publicación no enviará notificación.</p>
        }
        <ion-button expand="block" (click)="guardar()">Guardar en el calendario</ion-button>
        <ion-button expand="block" fill="outline" (click)="cancelar()">Cancelar</ion-button>
      </div>
    </ion-content>
  `,
  styles: [`ion-toggle { min-height: 48px; font-size: 15px; }`],
})
export class ProgramarPublicacionPage {
  datos = inject(DatosService);
  private recordatorios = inject(RecordatoriosService);
  private trabajo = inject(SesionTrabajoService);
  private router = inject(Router);
  private toast = inject(ToastController);
  redes = REDES;
  texto = '';
  red: Red = 'Google Business';
  fecha: string;
  hora = '09:00';
  hoy: string;
  recordatorio = true;

  constructor() {
    const d = new Date();
    this.hoy = `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
    const previo = this.trabajo.porProgramar();
    this.texto = previo?.texto ?? '';
    this.red = previo?.red ?? 'Google Business';
    // desde el Calendario llega el día elegido; desde el Editor se propone mañana
    const m = new Date(d.getTime() + 86400000);
    this.fecha = previo?.fecha ?? `${m.getFullYear()}-${dos(m.getMonth() + 1)}-${dos(m.getDate())}`;
  }

  async guardar() {
    if (!this.texto.trim()) return avisar(this.toast, 'Escribe el texto de la publicación.', 'danger');
    if (!this.fecha || !this.hora) return avisar(this.toast, 'Elige la fecha y la hora.', 'danger');
    const cuando = new Date(`${this.fecha}T${this.hora}:00`);
    if (isNaN(cuando.getTime()) || cuando.getTime() <= Date.now()) return avisar(this.toast, 'Elige una fecha y hora futuras.', 'danger');
    const pub: Publicacion = {
      id: nuevoId(), texto: this.texto.trim(), red: this.red, fecha: cuando.toISOString(), publicada: false,
      recordatorio: this.recordatorio, notificacionId: Math.floor(Math.random() * 2000000000) + 1,
    };
    await this.datos.guardarPublicacion(pub);
    const avisara = await this.recordatorios.programar(pub);
    this.trabajo.porProgramar.set(null);
    await avisar(this.toast, avisara ? 'Publicación programada con recordatorio.' : 'Publicación guardada en el calendario.', 'success');
    await this.router.navigateByUrl('/tabs/calendario', { replaceUrl: true });
  }

  cancelar() {
    this.trabajo.porProgramar.set(null);
    this.router.navigateByUrl('/tabs/calendario', { replaceUrl: true });
  }
}
