import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { DatosService } from '../core/datos.service';
import { Borrador } from '../core/models';
import { SesionTrabajoService } from '../core/sesion-trabajo.service';

type Filtro = 'todos' | 'publicacion' | 'respuesta';

/** Pantalla 11 · Borradores (RF13). */
@Component({
  selector: 'app-borradores',
  imports: [DatePipe, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon],
  template: `
    <ion-header><ion-toolbar><ion-title>Borradores</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <div class="pl-page">
        <div class="pl-chips" role="group" aria-label="Filtro de borradores">
          @for (f of filtros; track f.valor) {
            <button type="button" class="pl-chip" [class.on]="filtro() === f.valor" [attr.aria-pressed]="filtro() === f.valor" (click)="filtro.set(f.valor)">{{ f.texto }}</button>
          }
        </div>
        @for (b of visibles(); track b.id) {
          <div class="item">
            <button type="button" class="abrir" (click)="abrir(b)">
              <span><span class="pl-tag">{{ b.tipo === 'respuesta' ? 'Respuesta a reseña' : 'Publicación · ' + b.red }}</span> <small>{{ b.actualizado | date: 'd MMM' }}</small></span>
              <span class="texto">{{ b.texto }}</span>
            </button>
            <button type="button" class="borrar" aria-label="Eliminar borrador" (click)="eliminar(b)"><ion-icon name="trash-outline" aria-hidden="true"></ion-icon></button>
          </div>
        } @empty {
          <p class="pl-muted">No hay borradores guardados. Desde el editor toca «Guardar borrador» para verlos aquí.</p>
        }
        @if (visibles().length) { <p class="pl-muted centro">Toca un borrador para abrirlo en el editor.</p> }
      </div>
    </ion-content>
  `,
  styles: [`
    .item { display: flex; align-items: center; border: 1.5px solid var(--pl-line); border-radius: 12px; padding: 4px 6px 4px 4px; }
    .abrir { flex: 1; min-width: 0; border: none; background: none; text-align: left; font: inherit; color: var(--ion-text-color); padding: 10px; display: flex; flex-direction: column; gap: 8px; }
    .abrir small { font-size: 12px; color: var(--ion-color-medium); }
    .texto { font-size: 14px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .borrar { width: 44px; height: 44px; border: none; background: none; color: var(--ion-color-medium); font-size: 20px; }
    .centro { text-align: center; font-size: 13px; }
  `],
})
export class BorradoresPage {
  private datos = inject(DatosService);
  private trabajo = inject(SesionTrabajoService);
  private router = inject(Router);
  private alerta = inject(AlertController);
  filtros: { valor: Filtro; texto: string }[] = [
    { valor: 'todos', texto: 'Todos' }, { valor: 'publicacion', texto: 'Publicaciones' }, { valor: 'respuesta', texto: 'Respuestas' },
  ];
  filtro = signal<Filtro>('todos');
  visibles = computed(() => this.datos.borradores().filter((b) => this.filtro() === 'todos' || b.tipo === this.filtro()));

  abrir(b: Borrador) {
    this.trabajo.enEdicion.set(b);
    this.router.navigateByUrl('/editor');
  }

  async eliminar(b: Borrador) {
    const a = await this.alerta.create({
      header: 'Eliminar borrador', message: 'Esta acción no se puede deshacer.',
      buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Eliminar', role: 'destructive', handler: () => this.datos.eliminarBorrador(b.id) }],
    });
    await a.present();
  }
}
