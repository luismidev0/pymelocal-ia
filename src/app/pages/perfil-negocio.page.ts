import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonSelect, IonSelectOption,
  IonTextarea, IonTitle, IonToolbar, ToastController,
} from '@ionic/angular/standalone';
import { avisar } from '../core/avisos';
import { DatosService } from '../core/datos.service';
import { TIPOS_NEGOCIO, TONOS, Tono } from '../core/models';

/** Pantalla 04 · Perfil del negocio (RF4 al crearlo, RF5 al editarlo). */
@Component({
  selector: 'app-perfil-negocio',
  imports: [FormsModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonInput, IonSelect, IonSelectOption, IonTextarea, IonButton],
  template: `
    <ion-header><ion-toolbar>
      @if (editando) { <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/ajustes" text=""></ion-back-button></ion-buttons> }
      <ion-title>{{ editando ? 'Editar perfil' : 'Tu negocio' }}</ion-title>
    </ion-toolbar></ion-header>
    <ion-content>
      <form class="pl-page" (ngSubmit)="guardar()">
        <p class="pl-muted">Con estos datos la IA escribe como tu negocio. Puedes cambiarlos después.</p>
        <ion-input class="pl-in" fill="outline" label="Nombre del negocio" labelPlacement="stacked" placeholder="Ej.: Panadería La Esquina"
          [(ngModel)]="nombre" name="nombre"></ion-input>
        <ion-select class="pl-in" fill="outline" label="Tipo de negocio" labelPlacement="stacked" placeholder="Selecciona una opción"
          interface="action-sheet" cancelText="Cancelar" [(ngModel)]="tipo" name="tipo">
          @for (t of tipos; track t) { <ion-select-option [value]="t">{{ t }}</ion-select-option> }
        </ion-select>
        <ion-input class="pl-in" fill="outline" label="Ciudad" labelPlacement="stacked" placeholder="Ej.: Medellín"
          [(ngModel)]="ciudad" name="ciudad"></ion-input>
        <ion-textarea class="pl-in" fill="outline" label="Descripción corta" labelPlacement="stacked" [rows]="3" [maxlength]="200" [counter]="true"
          placeholder="Qué vendes y qué te hace diferente" [(ngModel)]="descripcion" name="descripcion"></ion-textarea>
        <div>
          <span class="pl-label">Tono de comunicación</span>
          <div class="pl-chips" role="group" aria-label="Tono de comunicación">
            @for (t of tonos; track t) {
              <button type="button" class="pl-chip" [class.on]="tono === t" [attr.aria-pressed]="tono === t" (click)="tono = t">{{ t }}</button>
            }
          </div>
        </div>
        <ion-button expand="block" type="submit">{{ editando ? 'Guardar cambios' : 'Guardar y continuar' }}</ion-button>
      </form>
    </ion-content>
  `,
})
export class PerfilNegocioPage {
  private datos = inject(DatosService);
  private router = inject(Router);
  private toast = inject(ToastController);
  editando = inject(ActivatedRoute).snapshot.queryParamMap.get('modo') === 'editar';
  tipos = TIPOS_NEGOCIO;
  tonos = TONOS;
  nombre = '';
  tipo = '';
  ciudad = '';
  descripcion = '';
  tono: Tono = 'Cercano';

  constructor() {
    const p = this.datos.perfil();
    if (p) ({ nombre: this.nombre, tipo: this.tipo, ciudad: this.ciudad, descripcion: this.descripcion, tono: this.tono } = p);
  }

  async guardar() {
    const error =
      !this.nombre.trim() ? 'Escribe el nombre del negocio.' :
      !this.tipo ? 'Selecciona el tipo de negocio.' :
      !this.ciudad.trim() ? 'Escribe la ciudad.' : '';
    if (error) return avisar(this.toast, error, 'danger');
    await this.datos.guardarPerfil({
      nombre: this.nombre.trim(), tipo: this.tipo, ciudad: this.ciudad.trim(),
      descripcion: this.descripcion.trim(), tono: this.tono,
    });
    await avisar(this.toast, this.editando ? 'Perfil actualizado.' : 'Perfil guardado.', 'success');
    await this.router.navigateByUrl(this.editando ? '/tabs/ajustes' : '/tabs/inicio', { replaceUrl: true });
  }
}
