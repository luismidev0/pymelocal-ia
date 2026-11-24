import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController, IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar,
} from '@ionic/angular/standalone';
import { DatosService } from '../core/datos.service';
import { Publicacion } from '../core/models';
import { RecordatoriosService } from '../core/recordatorios.service';
import { SesionTrabajoService } from '../core/sesion-trabajo.service';

const dos = (n: number) => String(n).padStart(2, '0');
const claveDia = (d: Date) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;

/** Pantalla 10 · Calendario (RF15 y RF16). */
@Component({
  selector: 'app-calendario',
  imports: [DatePipe, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonCheckbox],
  template: `
    <ion-header><ion-toolbar>
      <ion-title>Calendario</ion-title>
      <ion-buttons slot="end">
        <ion-button class="mas" fill="solid" shape="round" color="primary" aria-label="Nueva publicación" (click)="nueva()"><ion-icon slot="icon-only" name="add-outline"></ion-icon></ion-button>
      </ion-buttons>
    </ion-toolbar></ion-header>
    <ion-content>
      <div class="pl-page">
        <div class="mes">
          <button type="button" aria-label="Mes anterior" (click)="mover(-1)"><ion-icon name="chevron-back-outline" aria-hidden="true"></ion-icon></button>
          <b>{{ mayuscula((mes() | date: 'MMMM y') ?? '') }}</b>
          <button type="button" aria-label="Mes siguiente" (click)="mover(1)"><ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon></button>
        </div>
        <div class="grilla semana" aria-hidden="true">@for (d of ['L', 'M', 'X', 'J', 'V', 'S', 'D']; track $index) { <span>{{ d }}</span> }</div>
        <div class="grilla">
          @for (c of celdas(); track $index) {
            @if (c) {
              <button type="button" class="dia" [class.sel]="c.clave === dia()" [class.hoy]="c.clave === hoy" (click)="dia.set(c.clave)"
                [attr.aria-label]="c.n + ', ' + c.total + ' publicaciones'">
                {{ c.n }}<i [class.con]="c.total > 0" [class.hecho]="c.total > 0 && c.pendientes === 0"></i>
              </button>
            } @else { <span></span> }
          }
        </div>
        <h2 class="pl-h2 titulo">{{ mayuscula((dia() + 'T12:00:00' | date: "EEEE d 'de' MMMM") ?? '') }}</h2>
        @for (p of delDia(); track p.id) {
          <div class="pub" [class.lista]="p.publicada">
            <div class="cuerpo">
              <p>{{ p.texto }}</p>
              <div><span class="pl-tag">{{ p.red }}</span> <small>{{ p.fecha | date: 'h:mm a' }}</small></div>
            </div>
            <div class="lado">
              <ion-checkbox labelPlacement="end" [checked]="p.publicada" (ionChange)="marcar(p, $event.detail.checked)">Publicada</ion-checkbox>
              <button type="button" aria-label="Eliminar publicación" (click)="eliminar(p)"><ion-icon name="trash-outline" aria-hidden="true"></ion-icon></button>
            </div>
          </div>
        } @empty {
          <p class="pl-muted">No hay publicaciones para este día. Toca + para programar una.</p>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .mas { --padding-start: 10px; --padding-end: 10px; margin-right: 8px; width: 44px; height: 44px; min-height: 44px; }
    .mes { display: flex; align-items: center; justify-content: space-between; }
    .mes b { font-size: 16px; font-weight: 600; }
    .mes button { width: 44px; height: 44px; border: none; background: none; color: var(--ion-text-color); font-size: 22px; }
    .grilla { display: grid; grid-template-columns: repeat(7, 1fr); margin-top: -8px; }
    .semana { margin-top: -6px; } .semana span { text-align: center; font-size: 12px; color: var(--ion-color-medium); }
    .dia { height: 44px; border: none; border-radius: 10px; background: none; color: var(--ion-text-color); font: inherit; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 0; }
    .dia i { width: 5px; height: 5px; border-radius: 3px; } .dia i.con { background: var(--ion-color-primary); } .dia i.hecho { background: var(--ion-color-success); }
    .dia.hoy { font-weight: 700; color: var(--ion-color-primary); }
    .dia.sel { background: var(--ion-color-primary); color: #fff; } .dia.sel i.con { background: #fff; }
    .titulo { border-top: 1px solid var(--pl-line); padding-top: 14px; }
    .pub { display: flex; gap: 10px; border: 1.5px solid var(--pl-line); border-radius: 12px; padding: 12px; }
    .pub.lista { background: var(--pl-green-tint); border-color: var(--pl-green-tint); }
    .cuerpo { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
    .cuerpo p { margin: 0; font-size: 14px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .cuerpo small { font-size: 12px; color: var(--ion-color-medium); }
    .lado { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; }
    .lado ion-checkbox { font-size: 12px; min-height: 44px; }
    .lado button { width: 44px; height: 36px; border: none; background: none; color: var(--ion-color-medium); font-size: 20px; }
  `],
})
export class CalendarioPage {
  private datos = inject(DatosService);
  private recordatorios = inject(RecordatoriosService);
  private trabajo = inject(SesionTrabajoService);
  private router = inject(Router);
  private alerta = inject(AlertController);
  hoy = claveDia(new Date());
  mes = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  dia = signal(this.hoy);

  private porDia = computed(() => {
    const mapa = new Map<string, Publicacion[]>();
    for (const p of this.datos.publicaciones()) {
      const k = claveDia(new Date(p.fecha));
      mapa.set(k, [...(mapa.get(k) ?? []), p]);
    }
    return mapa;
  });

  celdas = computed(() => {
    const m = this.mes();
    const vacias = (m.getDay() + 6) % 7; // la semana empieza en lunes
    const dias = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    const lista: ({ n: number; clave: string; total: number; pendientes: number } | null)[] = Array(vacias).fill(null);
    for (let n = 1; n <= dias; n++) {
      const clave = claveDia(new Date(m.getFullYear(), m.getMonth(), n));
      const pubs = this.porDia().get(clave) ?? [];
      lista.push({ n, clave, total: pubs.length, pendientes: pubs.filter((p) => !p.publicada).length });
    }
    return lista;
  });

  delDia = computed(() => this.porDia().get(this.dia()) ?? []);

  mayuscula(t: string): string {
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  mover(delta: number) {
    const m = this.mes();
    this.mes.set(new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  nueva() {
    this.trabajo.porProgramar.set(this.dia() >= this.hoy ? { fecha: this.dia() } : {});
    this.router.navigateByUrl('/programar');
  }

  /** RF16 */
  async marcar(p: Publicacion, publicada: boolean) {
    const nueva = { ...p, publicada };
    await this.datos.guardarPublicacion(nueva);
    await this.recordatorios.programar(nueva);
  }

  async eliminar(p: Publicacion) {
    const a = await this.alerta.create({
      header: 'Eliminar publicación', message: 'Se quitará del calendario junto con su recordatorio.',
      buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Eliminar', role: 'destructive', handler: async () => {
        await this.recordatorios.cancelar(p);
        await this.datos.eliminarPublicacion(p.id);
      } }],
    });
    await a.present();
  }
}
