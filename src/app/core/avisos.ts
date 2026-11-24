import { ToastController } from '@ionic/angular/standalone';

export async function avisar(toast: ToastController, mensaje: string, color: 'dark' | 'danger' | 'success' = 'dark') {
  const t = await toast.create({ message: mensaje, duration: 2600, position: 'bottom', color });
  await t.present();
}
