import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AlertController, IonButton, IonContent, IonHeader, IonIcon, IonSelect, IonSelectOption, IonTitle,
  IonToggle, IonToolbar,
} from '@ionic/angular/standalone';
import { AuthService } from '../core/auth.service';
import { DatosService } from '../core/datos.service';
import { IaService } from '../core/ia.service';
import { RecordatoriosService } from '../core/recordatorios.service';

/** Pantalla 12 · Ajustes (RF3 y RF18; acceso a RF5). */
@Component({
  selector: 'app-ajustes',
  imports: [FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonToggle, IonSelect, IonSelectOption, IonButton],
  template: `
    <ion-header><ion-toolbar><ion-title>Ajustes</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <div class="pl-page">
        <div class="pl-card negocio">
          <div class="avatar" aria-hidden="true">{{ (datos.perfil()?.nombre ?? 'P').charAt(0).toUpperCase() }}</div>
          <div><b>{{ datos.perfil()?.nombre }}</b><small>{{ datos.perfil()?.tipo }} · {{ datos.perfil()?.ciudad }}</small></div>
        </div>

        <h2 class="pl-h2">Negocio</h2>
        <div class="lista">
          <a class="fila" routerLink="/perfil-negocio" [queryParams]="{ modo: 'editar' }"><span>Editar perfil del negocio</span><ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon></a>
          <div class="fila"><span>Tono de comunicación</span><small>{{ datos.perfil()?.tono }}</small></div>
        </div>

        <h2 class="pl-h2">Recordatorios</h2>
        <div class="lista">
          <ion-toggle class="fila" justify="space-between" [checked]="datos.preferencias().recordatorios" (ionChange)="cambiarRecordatorios($event.detail.checked)">Notificaciones de recordatorio</ion-toggle>
          <ion-select class="fila" label="Avisarme" interface="action-sheet" cancelText="Cancelar" [value]="datos.preferencias().antelacionMin"
            [disabled]="!datos.preferencias().recordatorios" (ionChange)="cambiarAntelacion($event.detail.value)">
            <ion-select-option [value]="0">A la hora programada</ion-select-option>
            <ion-select-option [value]="15">15 minutos antes</ion-select-option>
            <ion-select-option [value]="60">1 hora antes</ion-select-option>
          </ion-select>
        </div>

        <h2 class="pl-h2">Cuenta</h2>
        <div class="lista">
          <div class="fila"><span>Correo</span><small>{{ auth.usuario()?.correo }}</small></div>
          <button type="button" class="fila" (click)="acercaDe()"><span>Acerca de PymeLocal IA</span><ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon></button>
        </div>

        <ion-button expand="block" fill="outline" color="danger" (click)="salir()">Cerrar sesión</ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .negocio { display: flex; align-items: center; gap: 14px; }
    .avatar { width: 56px; height: 56px; border-radius: 12px; background: var(--pl-blue-tint); color: var(--ion-color-primary); font-size: 24px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .negocio b { display: block; font-size: 16px; font-weight: 600; } .negocio small { font-size: 13px; color: var(--ion-color-medium); }
    .lista { display: flex; flex-direction: column; margin-top: -8px; }
    .fila { min-height: 52px; display: flex; align-items: center; justify-content: space-between; gap: 8px; border: none; border-bottom: 1px solid var(--pl-line); background: none; padding: 0; font: inherit; font-size: 15px; color: var(--ion-text-color); text-decoration: none; text-align: left; width: 100%; }
    .fila small { font-size: 14px; color: var(--ion-color-medium); } .fila ion-icon { color: var(--ion-color-medium); font-size: 18px; }
    ion-select.fila { --padding-start: 0; }
  `],
})
export class AjustesPage {
  auth = inject(AuthService);
  datos = inject(DatosService);
  private ia = inject(IaService);
  private recordatorios = inject(RecordatoriosService);
  private router = inject(Router);
  private alerta = inject(AlertController);

  /** RF18 */
  async cambiarRecordatorios(activos: boolean) {
    await this.datos.guardarPreferencias({ ...this.datos.preferencias(), recordatorios: activos });
    await this.recordatorios.reprogramarTodo();
  }

  async cambiarAntelacion(minutos: number) {
    await this.datos.guardarPreferencias({ ...this.datos.preferencias(), antelacionMin: Number(minutos) });
    await this.recordatorios.reprogramarTodo();
  }

  async acercaDe() {
    const a = await this.alerta.create({
      header: 'PymeLocal IA',
      subHeader: 'Versión 0.2 · Entrega 2',
      message: `Proyecto del módulo Énfasis en programación móvil, Politécnico Grancolombiano. Acceso: ${this.auth.modo === 'firebase' ? 'Firebase Authentication' : 'cuentas en el dispositivo'}. Textos: ${this.ia.modo === 'ia' ? 'Firebase AI Logic (Gemini)' : 'generador de demostración'}.`,
      buttons: ['Cerrar'],
    });
    await a.present();
  }

  /** RF3 */
  async salir() {
    await this.auth.cerrarSesion();
    await this.router.navigateByUrl('/bienvenida', { replaceUrl: true });
  }
}
