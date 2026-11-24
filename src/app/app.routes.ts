import { Routes } from '@angular/router';
import { conPerfil, conSesion, sinSesion } from './core/guardas';

/** Flujo de navegación de las 12 pantallas (sección 4 del documento de diseño). */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'bienvenida' },
  { path: 'bienvenida', canActivate: [sinSesion], loadComponent: () => import('./pages/bienvenida.page').then((m) => m.BienvenidaPage) },
  { path: 'iniciar-sesion', canActivate: [sinSesion], loadComponent: () => import('./pages/iniciar-sesion.page').then((m) => m.IniciarSesionPage) },
  { path: 'registro', canActivate: [sinSesion], loadComponent: () => import('./pages/registro.page').then((m) => m.RegistroPage) },
  { path: 'perfil-negocio', canActivate: [conSesion], loadComponent: () => import('./pages/perfil-negocio.page').then((m) => m.PerfilNegocioPage) },
  {
    path: 'tabs',
    canActivate: [conPerfil],
    loadComponent: () => import('./pages/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', loadComponent: () => import('./pages/inicio.page').then((m) => m.InicioPage) },
      { path: 'borradores', loadComponent: () => import('./pages/borradores.page').then((m) => m.BorradoresPage) },
      { path: 'calendario', loadComponent: () => import('./pages/calendario.page').then((m) => m.CalendarioPage) },
      { path: 'ajustes', loadComponent: () => import('./pages/ajustes.page').then((m) => m.AjustesPage) },
    ],
  },
  { path: 'generar-publicacion', canActivate: [conPerfil], loadComponent: () => import('./pages/generar-publicacion.page').then((m) => m.GenerarPublicacionPage) },
  { path: 'responder-resena', canActivate: [conPerfil], loadComponent: () => import('./pages/responder-resena.page').then((m) => m.ResponderResenaPage) },
  { path: 'editor', canActivate: [conPerfil], loadComponent: () => import('./pages/editor-borrador.page').then((m) => m.EditorBorradorPage) },
  { path: 'programar', canActivate: [conPerfil], loadComponent: () => import('./pages/programar-publicacion.page').then((m) => m.ProgramarPublicacionPage) },
  { path: '**', redirectTo: 'bienvenida' },
];
