import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { DatosService } from './datos.service';

/** Solo deja pasar con sesión abierta; carga los datos del usuario. */
async function exigirSesion(auth: AuthService, datos: DatosService, router: Router): Promise<true | UrlTree> {
  await auth.listo;
  if (!auth.usuario()) return router.parseUrl('/bienvenida');
  await datos.cargar();
  return true;
}

export const conSesion: CanActivateFn = () => exigirSesion(inject(AuthService), inject(DatosService), inject(Router));

/** Además de la sesión, exige que el perfil del negocio esté creado (RF4). */
export const conPerfil: CanActivateFn = async () => {
  const datos = inject(DatosService);
  const router = inject(Router);
  const paso = await exigirSesion(inject(AuthService), datos, router);
  if (paso !== true) return paso;
  return datos.perfil() ? true : router.parseUrl('/perfil-negocio');
};

/** Si ya hay sesión, salta las pantallas de acceso. */
export const sinSesion: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.listo;
  return auth.usuario() ? router.parseUrl('/tabs/inicio') : true;
};
