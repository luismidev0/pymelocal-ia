import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Clipboard } from '@capacitor/clipboard';
import { Share } from '@capacitor/share';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonSpinner, IonTextarea,
  IonTitle, IonToolbar, ToastController,
} from '@ionic/angular/standalone';
import { avisar } from '../core/avisos';
import { DatosService } from '../core/datos.service';
import { IaService } from '../core/ia.service';
import { Borrador } from '../core/models';
import { SesionTrabajoService } from '../core/sesion-trabajo.service';

/** Pantalla 08 · Editor de borrador (RF8 a RF12). */
@Component({
  selector: 'app-editor-borrador',
  imports: [FormsModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonTextarea, IonButton, IonIcon, IonSpinner],
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/inicio" text=""></ion-back-button></ion-buttons>
      <ion-title>Editor de borrador</ion-title>
      <span slot="end" class="pl-tag red">{{ item.tipo === 'respuesta' ? 'Respuesta' : item.red }}</span>
    </ion-toolbar></ion-header>
    <ion-content>
      <div class="pl-page">
        <ion-textarea class="pl-in editor" fill="outline" [label]="item.tipo === 'respuesta' ? 'Texto de la respuesta' : 'Texto de la publicación'"
          labelPlacement="stacked" [rows]="11" [(ngModel)]="texto"></ion-textarea>
        <div class="pie"><span class="pl-muted">Revisa el texto antes de publicarlo.</span><span class="pl-muted">{{ texto.length }} caracteres</span></div>
        <div class="acciones">
          <button type="button" (click)="copiar()"><ion-icon name="copy-outline" aria-hidden="true"></ion-icon>Copiar</button>
          <button type="button" (click)="compartir()"><ion-icon name="share-social-outline" aria-hidden="true"></ion-icon>Compartir</button>
          <button type="button" (click)="regenerar()" [disabled]="cargando()">
            @if (cargando()) { <ion-spinner name="crescent"></ion-spinner> } @else { <ion-icon name="refresh-outline" aria-hidden="true"></ion-icon> }Regenerar
          </button>
        </div>
        @if (item.tipo === 'publicacion') {
          <ion-button expand="block" (click)="programar()"><ion-icon slot="start" name="calendar-outline"></ion-icon>Programar publicación</ion-button>
        }
        <ion-button expand="block" fill="outline" (click)="guardar()">Guardar borrador</ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .red { margin-right: 12px; }
    .editor { --border-color: var(--ion-color-primary); --border-width: 2px; }
    .pie { display: flex; justify-content: space-between; margin-top: -8px; } .pie span { font-size: 12px; }
    .acciones { display: flex; gap: 10px; }
    .acciones button { flex: 1; height: 64px; border: 1.5px solid var(--pl-line); border-radius: 10px; background: #fff; color: var(--ion-text-color); font: inherit; font-size: 13px; font-weight: 500; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
    .acciones ion-icon { font-size: 22px; color: var(--ion-color-primary); } .acciones ion-spinner { width: 22px; height: 22px; }
  `],
})
export class EditorBorradorPage {
  private ia = inject(IaService);
  private datos = inject(DatosService);
  private trabajo = inject(SesionTrabajoService);
  private router = inject(Router);
  private toast = inject(ToastController);
  item!: Borrador;
  texto = '';
  cargando = signal(false);

  constructor() {
    const actual = this.trabajo.enEdicion();
    if (!actual) {
      this.item = { id: '', tipo: 'publicacion', red: 'Google Business', texto: '', contexto: {}, actualizado: '' };
      this.router.navigateByUrl('/tabs/inicio', { replaceUrl: true });
      return;
    }
    this.item = actual;
    this.texto = actual.texto;
  }

  private vacio(): boolean {
    if (this.texto.trim()) return false;
    avisar(this.toast, 'El texto está vacío.', 'danger');
    return true;
  }

  /** RF10 */
  async copiar() {
    if (this.vacio()) return;
    await Clipboard.write({ string: this.texto });
    await avisar(this.toast, 'Texto copiado al portapapeles.', 'success');
  }

  /** RF11: menú nativo del dispositivo; si no existe (algunos navegadores), copia el texto. */
  async compartir() {
    if (this.vacio()) return;
    try {
      if ((await Share.canShare()).value) await Share.share({ text: this.texto, dialogTitle: 'Compartir texto' });
      else { await Clipboard.write({ string: this.texto }); await avisar(this.toast, 'Este navegador no permite compartir; el texto quedó copiado.'); }
    } catch { /* el usuario cerró el menú */ }
  }

  /** RF8 */
  async regenerar() {
    const perfil = this.datos.perfil()!;
    this.cargando.set(true);
    try {
      this.texto = this.item.tipo === 'respuesta'
        ? await this.ia.generarRespuesta(perfil, this.item.contexto.resena ?? '', this.item.contexto.estrellas ?? 5)
        : (await this.ia.generarIdeas(perfil, this.item.red, this.item.contexto.tema ?? ''))[0];
    } catch {
      await avisar(this.toast, 'No se pudo generar otra versión. Tu texto sigue igual; revisa la conexión y reintenta.', 'danger');
    } finally {
      this.cargando.set(false);
    }
  }

  /** RF12 */
  async guardar() {
    if (this.vacio()) return;
    this.item = { ...this.item, texto: this.texto };
    await this.datos.guardarBorrador(this.item);
    this.trabajo.enEdicion.set(this.item);
    await avisar(this.toast, 'Borrador guardado.', 'success');
  }

  programar() {
    if (this.vacio()) return;
    this.trabajo.porProgramar.set({ texto: this.texto, red: this.item.red });
    this.router.navigateByUrl('/programar');
  }
}
