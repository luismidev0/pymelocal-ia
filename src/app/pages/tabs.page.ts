import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';

/** Navegación principal: barra de pestañas inferior. */
@Component({
  selector: 'app-tabs',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="inicio"><ion-icon name="home-outline"></ion-icon><ion-label>Inicio</ion-label></ion-tab-button>
        <ion-tab-button tab="borradores"><ion-icon name="document-text-outline"></ion-icon><ion-label>Borradores</ion-label></ion-tab-button>
        <ion-tab-button tab="calendario"><ion-icon name="calendar-outline"></ion-icon><ion-label>Calendario</ion-label></ion-tab-button>
        <ion-tab-button tab="ajustes"><ion-icon name="settings-outline"></ion-icon><ion-label>Ajustes</ion-label></ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`ion-tab-bar { --border: 1px solid var(--pl-line); height: 64px; } ion-tab-button { --color-selected: var(--ion-color-primary); --color: var(--ion-color-medium); font-size: 12px; }`],
})
export class TabsPage {}
