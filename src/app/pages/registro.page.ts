import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonInput, IonSpinner,
  IonTitle, IonToolbar, ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../core/auth.service';
import { avisar } from '../core/avisos';
import { DatosService } from '../core/datos.service';

/** Pantalla 03 · Registro (RF1). */
@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonInput, IonCheckbox, IonButton, IonSpinner],
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/bienvenida" text=""></ion-back-button></ion-buttons>
      <ion-title>Crear cuenta</ion-title>
    </ion-toolbar></ion-header>
    <ion-content>
      <form class="pl-page" (ngSubmit)="crear()">
        <ion-input class="pl-in" fill="outline" label="Nombre" labelPlacement="stacked" placeholder="Tu nombre"
          autocomplete="name" [(ngModel)]="nombre" name="nombre"></ion-input>
        <ion-input class="pl-in" fill="outline" label="Correo electrónico" labelPlacement="stacked" type="email" inputmode="email"
          autocomplete="email" placeholder="nombre@correo.com" [(ngModel)]="correo" name="correo"></ion-input>
        <ion-input class="pl-in" fill="outline" label="Contraseña" labelPlacement="stacked" type="password"
          autocomplete="new-password" placeholder="Mínimo 8 caracteres" [(ngModel)]="clave" name="clave"></ion-input>
        <ion-input class="pl-in" fill="outline" label="Confirmar contraseña" labelPlacement="stacked" type="password"
          autocomplete="new-password" placeholder="Repite la contraseña" [(ngModel)]="clave2" name="clave2"></ion-input>
        <ion-checkbox labelPlacement="end" justify="start" [(ngModel)]="acepta" name="acepta">Acepto los términos y la política de privacidad</ion-checkbox>
        <ion-button expand="block" type="submit" [disabled]="cargando()">
          @if (cargando()) { <ion-spinner name="crescent"></ion-spinner> } @else { Crear cuenta }
        </ion-button>
        <p class="pl-muted centro">¿Ya tienes cuenta? <a routerLink="/iniciar-sesion">Iniciar sesión</a></p>
      </form>
    </ion-content>
  `,
  styles: [`.centro { text-align: center; } a { color: var(--ion-color-primary); font-weight: 600; text-decoration: none; } ion-checkbox { font-size: 14px; min-height: 44px; }`],
})
export class RegistroPage {
  private auth = inject(AuthService);
  private datos = inject(DatosService);
  private router = inject(Router);
  private toast = inject(ToastController);
  nombre = '';
  correo = '';
  clave = '';
  clave2 = '';
  acepta = false;
  cargando = signal(false);

  async crear() {
    const error =
      !this.nombre.trim() ? 'Escribe tu nombre.' :
      !/^\S+@\S+\.\S+$/.test(this.correo.trim()) ? 'Escribe un correo válido.' :
      this.clave.length < 8 ? 'La contraseña debe tener al menos 8 caracteres.' :
      this.clave !== this.clave2 ? 'Las contraseñas no coinciden.' :
      !this.acepta ? 'Debes aceptar los términos para continuar.' : '';
    if (error) return avisar(this.toast, error, 'danger');
    this.cargando.set(true);
    try {
      await this.auth.registrar(this.nombre.trim(), this.correo, this.clave);
      await this.datos.cargar();
      this.clave = this.clave2 = '';
      await this.router.navigateByUrl('/perfil-negocio', { replaceUrl: true });
    } catch (e) {
      await avisar(this.toast, (e as Error).message, 'danger');
    } finally {
      this.cargando.set(false);
    }
  }
}
