# PymeLocal IA

Aplicación híbrida (Android, iOS y web) para dueños de negocios pequeños: genera ideas de
publicaciones y borradores de respuesta a reseñas, y organiza las publicaciones en un
calendario con recordatorios.

Proyecto del módulo **Énfasis en programación móvil** — Politécnico Grancolombiano.
Autor: Luis Miguel Álvarez.

## Tecnología

- Ionic Framework 8 con Angular 20 (componentes standalone)
- Capacitor 7: Preferences, Share, Clipboard y Local Notifications
- Firebase (opcional): Authentication y AI Logic con Gemini

## Cómo ejecutarla

```bash
npm install
npx ng serve            # abre http://localhost:4200
```

## Cómo generar el APK

```bash
npx ng build
npx cap sync android
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

El flujo `.github/workflows/apk.yml` hace lo mismo en GitHub Actions y publica el APK
en la sección Releases del repositorio.

## Modos de funcionamiento

`src/app/firebase.config.ts` decide el modo:

| `firebaseConfig` | Inicio de sesión | Generación de textos |
| --- | --- | --- |
| `null` | Cuentas guardadas en el dispositivo | Generador de demostración (plantillas) |
| Configuración del proyecto | Firebase Authentication | Firebase AI Logic (Gemini) |

En los dos modos, el perfil del negocio, los borradores y el calendario se guardan en el
dispositivo y funcionan sin conexión.

## Estructura

```
src/app/
  core/     servicios: sesión, datos locales, IA, recordatorios y guardas de ruta
  pages/    las 12 pantallas del flujo de navegación
  app.routes.ts   rutas y navegación
```

## Requerimientos funcionales por pantalla

| Pantalla | Archivo | RF |
| --- | --- | --- |
| Bienvenida | `pages/bienvenida.page.ts` | punto de partida |
| Iniciar sesión | `pages/iniciar-sesion.page.ts` | RF2 |
| Registro | `pages/registro.page.ts` | RF1 |
| Perfil del negocio | `pages/perfil-negocio.page.ts` | RF4, RF5 |
| Inicio | `pages/inicio.page.ts` | acceso a RF6 y RF7 |
| Generar publicación | `pages/generar-publicacion.page.ts` | RF6, RF8 |
| Responder reseña | `pages/responder-resena.page.ts` | RF7, RF8 |
| Editor de borrador | `pages/editor-borrador.page.ts` | RF8 a RF12 |
| Programar publicación | `pages/programar-publicacion.page.ts` | RF14, RF17 |
| Calendario | `pages/calendario.page.ts` | RF15, RF16 |
| Borradores | `pages/borradores.page.ts` | RF13 |
| Ajustes | `pages/ajustes.page.ts` | RF3, RF18 |
