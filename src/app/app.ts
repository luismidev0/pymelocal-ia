import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, arrowBackOutline, calendarOutline, chatboxEllipsesOutline, chevronBackOutline,
  chevronForwardOutline, copyOutline, documentTextOutline, homeOutline, refreshOutline,
  settingsOutline, shareSocialOutline, sparklesOutline, star, starOutline, trashOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet],
  template: `<ion-app><ion-router-outlet></ion-router-outlet></ion-app>`,
})
export class App {
  constructor() {
    addIcons({
      addOutline, arrowBackOutline, calendarOutline, chatboxEllipsesOutline, chevronBackOutline,
      chevronForwardOutline, copyOutline, documentTextOutline, homeOutline, refreshOutline,
      settingsOutline, shareSocialOutline, sparklesOutline, star, starOutline, trashOutline,
    });
  }
}
