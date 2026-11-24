import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonSpinner, IonTitle,
  IonToolbar, ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../core/auth.service';
import { avisar } from '../core/avisos';
import { DatosService } from '../core/datos.service';

/** Pantalla 02 · Iniciar sesión (RF2). */
@Component({
  selector: 'app-iniciar-sesion',
  imports: [FormsModule, RouterLink, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonInput, IonButton, IonSpinner],
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/bienvenida" text=""></ion-back-button></ion-buttons>
      <ion-title>Iniciar sesión</ion-title>
    </ion-toolbar></ion-header>
    <ion-content>
      <form class="pl-page" (ngSubmit)="entrar()">
        <p class="pl-muted">Ingresa con el correo de tu negocio.</p>
        <ion-input class="pl-in" fill="outline" label="Correo electrónico" labelPlacement="stacked" type="email" inputmode="email"
          autocomplete="email" placeholder="nombre@correo.com" [(ngModel)]="correo" name="correo"></ion-input>
        <ion-input class="pl-in" fill="outline" label="Contraseña" labelPlacement="stacked" type="password"
          autocomplete="current-password" placeholder="Tu contraseña" [(ngModel)]="clave" name="clave"></ion-input>
        <div class="derecha"><ion-button fill="clear" size="small" type="button" (click)="recuperar()">¿Olvidaste tu contraseña?</ion-button></div>
        <ion-button expand="block" type="submit" [disabled]="cargando()">
          @if (cargando()) { <ion-spinner name="crescent"></ion-spinner> } @else { Iniciar sesión }
        </ion-button>
        <p class="pl-muted centro">¿No tienes cuenta? <a routerLink="/registro">Crear cuenta</a></p>
      </form>
    </ion-content>
  `,
  styles: [`.derecha { display: flex; justify-content: flex-end; margin-top: -8px; } .centro { text-align: center; } a { color: var(--ion-color-primary); font-weight: 600; text-decoration: none; }`],
})
export class IniciarSesionPage {
  private auth = inject(AuthService);
  private datos = inject(DatosService);
  private router = inject(Router);
  private toast = inject(ToastController);
  correo = '';
  clave = '';
  cargando = signal(false);

  async entrar() {
    if (!this.correo.trim() || !this.clave) return avisar(this.toast, 'Escribe tu correo y tu contraseña.', 'danger');
    this.cargando.set(true);
    try {
      await this.auth.iniciarSesion(this.correo, this.clave);
      await this.datos.cargar();
      this.clave = '';
      await this.router.navigateByUrl(this.datos.perfil() ? '/tabs/inicio' : '/perfil-negocio', { replaceUrl: true });
    } catch (e) {
      await avisar(this.toast, (e as Error).message, 'danger');
    } finally {
      this.cargando.set(false);
    }
  }

  async recuperar() {
    await avisar(this.toast, await this.auth.recuperarClave(this.correo));
  }
}
