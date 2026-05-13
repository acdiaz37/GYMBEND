# Plan estrategico de migracion a Firebase

Este documento define una ruta detallada para migrar GYMBEND desde su persistencia actual en `localStorage` hacia Firebase, agregando login y sincronizacion en la nube sin perder la funcionalidad actual.

El objetivo no es reemplazar todo de golpe, sino evolucionar el backend artesanal actual hacia una arquitectura Firebase verificable, segura y reversible por fases.

## 1. Estado actual del proyecto

GYMBEND actualmente funciona como una app Next.js mobile-first/PWA con persistencia local en el navegador.

### Funcionalidad existente que debe conservarse

- Dashboard principal con progreso semanal.
- Lista de todas las rutinas disponibles.
- Rutinas semilla creadas automaticamente.
- Crear rutinas personalizadas.
- Editar rutinas existentes.
- Eliminar rutinas.
- Buscar ejercicios en la biblioteca.
- Filtrar ejercicios por tipo y dificultad.
- Marcar ejercicios como favoritos.
- Reproducir rutinas paso a paso.
- Manejar ejercicios por tiempo y por repeticiones.
- Descansos automaticos entre ejercicios.
- Registro de rutinas completadas.
- Funcionamiento PWA con manifest, iconos y service worker.
- Funcionamiento offline basico para datos ya cargados en el navegador.

### Backend artesanal actual

La capa de persistencia actual esta concentrada en:

- `lib/storage/provider.ts`
- `lib/storage/local-provider.ts`
- `components/StorageProvider.tsx`

El contrato principal esta definido por `StorageProvider`:

```ts
export interface StorageProvider {
  getRoutines(): Promise<Routine[]>;
  saveRoutine(routine: Routine): Promise<void>;
  deleteRoutine(id: string): Promise<void>;
  getFavorites(): Promise<string[]>;
  toggleFavorite(exerciseId: string): Promise<boolean>;
  getProgress(): Promise<ProgressLog[]>;
  logProgress(log: ProgressLog): Promise<void>;
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;
}
```

Ese contrato es el ancla mas importante de la migracion: permite introducir Firebase sin reescribir toda la app al mismo tiempo.

### Datos locales actuales

`LocalStorageProvider` usa estas llaves:

- `gymbend_routines`
- `gymbend_progress`
- `gymbend_settings`

Los tipos estan definidos en:

- `types/index.ts`

Entidades actuales:

- `Exercise`
- `RoutineExercise`
- `Routine`
- `ProgressLog`
- `Settings`

## 2. Objetivo de arquitectura

La arquitectura objetivo debe tener:

- Firebase Authentication para login.
- Cloud Firestore para rutinas, favoritos, settings y progreso.
- Seguridad por usuario mediante Firestore Security Rules.
- Migracion automatica desde `localStorage` al primer login.
- Modo invitado opcional para no romper el uso actual sin cuenta.
- Capa de storage intercambiable para mantener estable la UI.
- Estrategia de rollback si Firebase falla.

## 3. Decision clave: mantener Netlify o mover hosting a Firebase

Firebase puede convivir con Netlify sin problema.

### Opcion recomendada inicialmente

Mantener Netlify como hosting y usar Firebase solo para:

- Authentication
- Firestore
- Opcionalmente Analytics/App Check mas adelante

Ventajas:

- Menos cambios de infraestructura.
- Netlify ya esta conectado a GitHub.
- La app ya compila correctamente como Next.js.
- Firebase JS SDK funciona desde el cliente.
- Firestore Security Rules protegen los datos sin crear un servidor propio.

### Opcion futura

Migrar tambien el hosting a Firebase App Hosting o Firebase Hosting.

Esto solo deberia evaluarse si:

- Se quiere concentrar toda la infraestructura en Firebase.
- Se necesita integracion mas profunda con Google Cloud.
- Se planea usar SSR autenticado o funciones server-side avanzadas.

Para esta migracion, el plan asume que Netlify se mantiene.

## 4. Modelo de datos propuesto en Firestore

Cada usuario debe tener sus datos aislados por `uid`.

Estructura recomendada:

```text
users/{uid}
  profile
    uid
    email
    displayName
    photoURL
    provider
    createdAt
    updatedAt
    migratedFromLocalStorage
    migrationVersion

users/{uid}/routines/{routineId}
  id
  name
  exercises
  createdAt
  updatedAt
  source
  isSeed

users/{uid}/progress/{progressLogId}
  id
  routineId
  completedAt
  duration

users/{uid}/settings/main
  favorites
  updatedAt
```

### Por que esta estructura

- Permite reglas simples: cada usuario solo accede a `users/{uid}` cuando `request.auth.uid == uid`.
- Evita filtrar por `userId` en cada query.
- Mantiene separadas rutinas, progreso y settings.
- Facilita backups o exportacion por usuario.
- Evita que un usuario pueda consultar accidentalmente datos de otros.

### Datos que se mantienen estaticos

`data/exercises.json` debe quedarse como dato estatico de la app por ahora.

Motivo:

- La biblioteca de ejercicios ya viene versionada con el codigo.
- No depende del usuario.
- Evita lecturas Firestore innecesarias.
- Permite que la app cargue la biblioteca aunque el usuario no este logueado.

En una fase futura, la biblioteca podria moverse a Firestore o a Cloud Storage si se desea gestionarla desde un panel admin.

## 5. Puntos de anclaje en el codigo actual

Esta seccion lista exactamente donde debe conectarse Firebase sin romper la app.

### 5.1 `lib/storage/provider.ts`

Ancla principal.

Accion:

- Mantener la interfaz `StorageProvider`.
- Agregar metodos solo si son imprescindibles.
- Evitar que las paginas conozcan directamente Firestore.

Resultado esperado:

- La UI sigue usando `useStorage()`.
- Se puede alternar entre `LocalStorageProvider` y `FirebaseStorageProvider`.

### 5.2 `lib/storage/local-provider.ts`

Ancla de compatibilidad y rollback.

Accion:

- No eliminarlo.
- Usarlo para modo invitado.
- Usarlo como fuente de migracion inicial.
- Usarlo como fallback si el usuario no ha iniciado sesion.

Resultado esperado:

- La app sigue funcionando sin login.
- No se pierden datos actuales del navegador.

### 5.3 `components/StorageProvider.tsx`

Ancla para seleccionar proveedor.

Accion:

- Convertirlo en un provider consciente de Auth.
- Si hay usuario autenticado, usar `FirebaseStorageProvider`.
- Si no hay usuario, usar `LocalStorageProvider`.
- Exponer estado de carga si Auth todavia esta resolviendo sesion.

Resultado esperado:

- Las paginas no cambian mucho.
- El storage depende del estado de login.

### 5.4 `app/layout.tsx`

Ancla global de providers.

Accion:

- Envolver la app con un `AuthProvider`.
- Mantener `StorageProviderClient`.
- Evitar inicializar Firebase en server components.

Resultado esperado:

- Auth queda disponible en toda la app.
- El layout sigue siendo compatible con Next App Router.

### 5.5 `app/page.tsx`

Consume:

- `storage.getRoutines()`
- `storage.getProgress()`
- `storage.getFavorites()`
- `storage.saveRoutine()`
- `storage.deleteRoutine()`

Riesgo principal:

- La rutina semilla actualmente se crea desde el cliente en el home.

Accion:

- Hacer que el seeding sea idempotente en Firebase.
- Marcar rutinas semilla con `isSeed: true` y/o `source: "seed"`.
- Evitar borrar rutinas del usuario por errores de sincronizacion.
- No ejecutar seeding hasta que el storage este listo.

Verificacion:

- Al primer login aparecen las rutinas semilla.
- Al refrescar no se duplican.
- Al editar una rutina semilla, se conserva el cambio del usuario.
- Al crear una rutina nueva, aparece junto a las demas.

### 5.6 `app/library/page.tsx`

Consume:

- `storage.getFavorites()`
- `storage.toggleFavorite()`

Accion:

- Guardar favoritos en `users/{uid}/settings/main`.
- Mantener fallback local si no hay usuario.
- Asegurar que el toggle sea atomico o resistente a clicks repetidos.

Verificacion:

- Favoritos persisten tras refresh.
- Favoritos se sincronizan entre navegadores con la misma cuenta.
- Favoritos locales se migran al iniciar sesion.

### 5.7 `app/builder/page.tsx`

Consume:

- `storage.getRoutines()`
- `storage.saveRoutine()`

Accion:

- Guardar rutinas en `users/{uid}/routines/{routineId}`.
- Preservar `id`, `createdAt`, `updatedAt`.
- Validar que `exercises` solo contenga ids existentes en `data/exercises.json`.

Verificacion:

- Crear rutina funciona.
- Editar rutina funciona.
- Reordenar ejercicios funciona.
- Duraciones y reps se mantienen.
- Refresh no pierde cambios.

### 5.8 `app/player/page.tsx`

Consume:

- `storage.getRoutines()`
- `storage.logProgress()`

Accion:

- Leer rutina desde Firebase si el usuario esta logueado.
- Registrar progreso en `users/{uid}/progress/{progressLogId}`.
- Mantener la experiencia del player sin depender de latencia una vez cargada la rutina.

Verificacion:

- El player carga una rutina Firebase.
- Completar rutina crea un log de progreso.
- El dashboard semanal refleja el log.
- Si se refresca durante una rutina, no se corrompe el progreso previo.

## 6. Firebase Authentication

### Proveedores recomendados

Fase inicial:

- Email/password.
- Google provider.

Fase posterior:

- Apple si el uso movil/PWA lo justifica.
- Anonymous auth si se quiere convertir usuarios invitados sin friccion.

### Flujo recomendado de UX

1. Usuario abre la app.
2. Si no esta logueado, puede:
   - seguir como invitado;
   - iniciar sesion;
   - crear cuenta.
3. Si inicia sesion por primera vez y tiene datos locales:
   - la app detecta rutinas/favoritos/progreso en `localStorage`;
   - muestra una confirmacion clara;
   - migra los datos a Firestore;
   - marca `migratedFromLocalStorage: true`;
   - no borra los datos locales hasta confirmar exito.
4. Si ya tiene cuenta:
   - carga datos desde Firestore;
   - conserva los datos locales como fallback temporal.

### Componentes nuevos sugeridos

- `components/AuthProvider.tsx`
- `components/AuthGate.tsx`
- `components/LoginModal.tsx`
- `components/UserMenu.tsx`
- `lib/firebase/client.ts`
- `lib/firebase/auth.ts`
- `lib/storage/firebase-provider.ts`
- `lib/storage/migration.ts`

## 7. Firestore provider

Crear `FirebaseStorageProvider` que implemente `StorageProvider`.

Responsabilidades:

- Recibir `uid`.
- Leer y escribir en rutas bajo `users/{uid}`.
- Convertir timestamps si se decide usar `serverTimestamp()`.
- Mantener el mismo shape de datos que espera la UI.
- Manejar errores sin romper la experiencia.

### Contrato esperado

```ts
class FirebaseStorageProvider implements StorageProvider {
  constructor(uid: string) {}

  getRoutines(): Promise<Routine[]> {}
  saveRoutine(routine: Routine): Promise<void> {}
  deleteRoutine(id: string): Promise<void> {}
  getFavorites(): Promise<string[]> {}
  toggleFavorite(exerciseId: string): Promise<boolean> {}
  getProgress(): Promise<ProgressLog[]> {}
  logProgress(log: ProgressLog): Promise<void> {}
  getSettings(): Promise<Settings> {}
  saveSettings(settings: Settings): Promise<void> {}
}
```

### Importante

No se debe pasar Firestore directamente a las paginas. Las paginas deben seguir hablando con `StorageProvider`.

## 8. Reglas de seguridad Firestore

Reglas base recomendadas:

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, create, update, delete: if request.auth != null
        && request.auth.uid == userId;

      match /routines/{routineId} {
        allow read, create, update, delete: if request.auth != null
          && request.auth.uid == userId;
      }

      match /progress/{progressLogId} {
        allow read, create, update, delete: if request.auth != null
          && request.auth.uid == userId;
      }

      match /settings/{settingsId} {
        allow read, create, update, delete: if request.auth != null
          && request.auth.uid == userId;
      }
    }
  }
}
```

### Mejoras posteriores

Agregar validacion de shape:

- `routines.name` debe ser string.
- `routines.exercises` debe ser lista.
- `progress.duration` debe ser numero positivo.
- `settings.favorites` debe ser lista.
- No permitir writes a `users/{otherUid}`.

Agregar limites:

- Maximo de rutinas por usuario.
- Maximo de ejercicios por rutina.
- Maximo de favoritos.
- Maximo de logs por batch si se migran datos antiguos.

## 9. Migracion de datos locales sin perdida

Esta es la fase mas delicada.

### Principio principal

Nunca borrar `localStorage` hasta que:

- todos los datos hayan sido escritos en Firestore;
- se haya leido Firestore de vuelta;
- se confirme que el conteo coincide;
- se marque la migracion como completada.

### Datos a migrar

Desde `localStorage`:

- `gymbend_routines` a `users/{uid}/routines/{routineId}`
- `gymbend_progress` a `users/{uid}/progress/{progressLogId}`
- `gymbend_settings` a `users/{uid}/settings/main`

### Estrategia de migracion

1. Usuario inicia sesion.
2. Leer datos locales actuales.
3. Leer perfil `users/{uid}`.
4. Si `migrationVersion >= 1`, no repetir migracion automaticamente.
5. Si no esta migrado:
   - comparar datos locales vs Firestore;
   - fusionar sin duplicar por `id`;
   - priorizar `updatedAt` mas reciente para rutinas con mismo `id`;
   - unir favoritos como set;
   - unir progreso por `id`;
   - escribir todo en batch o en lotes controlados;
   - leer Firestore otra vez;
   - validar conteos;
   - marcar perfil como migrado.

### Conflictos

Rutinas con mismo `id`:

- Si una existe local y remota, gana la de `updatedAt` mas reciente.
- Si falta `updatedAt`, gana la remota para evitar pisar datos sincronizados.

Favoritos:

- Se combinan como union de ids.

Progreso:

- Se combina por `id`.
- Si hubiera ids duplicados, conservar uno.

Settings:

- `favorites` se une.
- Cualquier nuevo campo futuro debe tener merge explicito.

### Backup local

Antes de migrar, crear una copia:

- `gymbend_backup_before_firebase_migration`

Contenido:

```json
{
  "createdAt": "ISO_DATE",
  "routines": [],
  "progress": [],
  "settings": {}
}
```

Esto permite recuperar datos si algo falla.

## 10. Offline y experiencia sin conexion

Firestore puede soportar cache offline en cliente, pero debe evaluarse con cuidado en Next.js.

Objetivo minimo:

- Si el usuario esta sin conexion y ya tenia datos locales, no romper la app.
- Si el usuario esta logueado pero Firestore falla, mostrar datos cacheados cuando sea posible.
- No bloquear el player una vez la rutina ya cargo.

Estrategia por fases:

1. Mantener `LocalStorageProvider` como fallback.
2. Guardar una copia local de los ultimos datos sincronizados.
3. Activar persistencia offline de Firestore solo despues de probarla en navegadores objetivo.
4. Mostrar estados claros: sincronizado, offline, pendiente de sync.

## 11. Variables de entorno

Agregar en Netlify:

```text
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Estas variables son publicas por diseno cuando se usa Firebase Web SDK. La seguridad real debe estar en Firestore Security Rules, no en ocultar estas claves.

## 12. Dependencias nuevas

Instalar:

```bash
npm install firebase
```

Opcional para pruebas:

```bash
npm install -D firebase-tools
```

Si se agregan tests con emuladores, considerar:

```bash
npm install -D @firebase/rules-unit-testing
```

## 13. Fases de implementacion

### Fase 0 - Preparacion

Objetivo:

Preparar el proyecto sin cambiar comportamiento.

Tareas:

- Crear proyecto Firebase.
- Habilitar Authentication.
- Habilitar Firestore en modo production.
- Crear app web Firebase.
- Configurar variables de entorno en `.env.local` y Netlify.
- Agregar `firebase` como dependencia.
- Crear `lib/firebase/client.ts`.
- Crear `components/AuthProvider.tsx`.
- Mantener todo usando `LocalStorageProvider`.

Verificacion:

- `npm run build` pasa.
- App abre sin variables rotas.
- No cambia la experiencia actual.

### Fase 1 - Auth sin migrar datos

Objetivo:

Permitir login/logout sin tocar rutinas todavia.

Tareas:

- Implementar `AuthProvider`.
- Implementar login con Google.
- Implementar email/password si se decide incluir desde el inicio.
- Agregar UI minima de cuenta.
- Guardar/actualizar `users/{uid}` al iniciar sesion.
- Mantener storage local aunque el usuario este logueado.

Verificacion:

- Usuario puede iniciar sesion.
- Usuario puede cerrar sesion.
- Refresh conserva sesion.
- App sigue mostrando rutinas locales.
- No se pierde ningun dato local.

### Fase 2 - FirebaseStorageProvider en paralelo

Objetivo:

Construir provider Firebase sin conectarlo como default.

Tareas:

- Crear `lib/storage/firebase-provider.ts`.
- Implementar todos los metodos de `StorageProvider`.
- Crear utilidades para rutas Firestore.
- Agregar manejo de errores.
- Agregar tests manuales o unitarios para CRUD basico.

Verificacion:

- Crear rutina en Firestore funciona.
- Leer rutinas desde Firestore funciona.
- Editar rutina funciona.
- Eliminar rutina funciona.
- Favoritos funcionan.
- Progreso funciona.
- Usuario A no puede leer datos de Usuario B.

### Fase 3 - Migracion local a Firebase

Objetivo:

Subir los datos existentes del usuario a Firestore sin perdida.

Tareas:

- Crear `lib/storage/migration.ts`.
- Detectar datos locales.
- Crear backup local.
- Crear merge local/remoto.
- Escribir batches.
- Confirmar conteos.
- Marcar `migrationVersion: 1`.
- Mostrar estado de migracion en UI.

Verificacion:

- Usuario con rutinas locales inicia sesion y no pierde nada.
- Rutinas locales aparecen tras refresh desde Firestore.
- Favoritos locales aparecen tras refresh.
- Progreso local aparece en dashboard semanal.
- Repetir refresh no duplica datos.
- Logout vuelve a modo invitado sin romper datos.

### Fase 4 - Activar Firebase como storage principal

Objetivo:

Cuando hay usuario autenticado, usar Firestore como fuente principal.

Tareas:

- Actualizar `StorageProviderClient`.
- Seleccionar provider segun auth state.
- Mientras auth carga, mostrar estado de carga o usar fallback controlado.
- Asegurar que el seeding de rutinas no duplique.
- Asegurar que el dashboard espere datos correctos.

Verificacion:

- Usuario logueado ve datos Firestore.
- Usuario invitado ve datos locales.
- Crear rutina logueado guarda en Firestore.
- Crear rutina invitado guarda local.
- Refresh mantiene datos correctos.
- Dos navegadores con la misma cuenta ven los mismos datos.

### Fase 5 - Seguridad y reglas

Objetivo:

Cerrar accesos inseguros antes de produccion.

Tareas:

- Escribir `firestore.rules`.
- Probar reglas en Firebase Emulator o Rules Playground.
- Verificar acceso permitido solo a `users/{uid}` propio.
- Agregar validaciones basicas de estructura.
- Documentar limites de datos.

Verificacion:

- Usuario autenticado lee/escribe sus datos.
- Usuario autenticado no lee/escribe datos de otro uid.
- Usuario anonimo no lee/escribe Firestore.
- Writes con shape invalido son rechazados.

### Fase 6 - QA funcional completa

Objetivo:

Confirmar que no se perdio funcionalidad actual.

Checklist:

- Home muestra todas las rutinas.
- Rutinas semilla aparecen una sola vez.
- Crear rutina.
- Editar rutina.
- Eliminar rutina.
- Reordenar ejercicios.
- Cambiar duracion de stretch.
- Cambiar reps de workout.
- Buscar en biblioteca.
- Filtrar por stretch/workout.
- Filtrar por dificultad.
- Agregar favoritos.
- Quitar favoritos.
- Reproducir rutina completa.
- Completar rutina crea progreso.
- Progreso semanal se actualiza.
- Refresh conserva todo.
- Logout no borra datos remotos.
- Login en otro navegador recupera datos.
- Modo invitado sigue funcionando.
- Build en Netlify pasa.

### Fase 7 - Limpieza controlada

Objetivo:

Reducir deuda sin quitar fallback demasiado pronto.

Tareas:

- Mantener backup local durante al menos una version.
- Agregar opcion manual "Exportar datos".
- Agregar opcion manual "Importar datos" si se considera necesario.
- Documentar soporte para recuperar datos locales.
- Solo despues de validar usuarios reales, considerar limpiar backups antiguos.

## 14. Riesgos principales y mitigaciones

### Riesgo: duplicacion de rutinas semilla

Mitigacion:

- Usar ids estables para rutinas semilla o marcar `isSeed`.
- Verificar por nombre normalizado y por `source`.
- No recrear si ya existen.

### Riesgo: perdida de datos locales durante migracion

Mitigacion:

- Backup antes de migrar.
- No borrar localStorage automaticamente.
- Validar conteos despues de escribir.
- Registrar `migrationVersion`.

### Riesgo: datos de usuarios expuestos

Mitigacion:

- Reglas por `request.auth.uid == userId`.
- No usar reglas globales tipo `allow read, write: if request.auth != null`.
- Probar con emulador.

### Riesgo: la UI se rompe mientras Auth carga

Mitigacion:

- Estado `authLoading`.
- Skeleton o pantalla breve.
- No ejecutar seeding hasta tener storage listo.

### Riesgo: Firestore costoso por demasiadas lecturas

Mitigacion:

- Leer colecciones solo cuando haga falta.
- Cachear en contexto.
- Evitar listeners en tiempo real si no son necesarios.
- Usar `getDocs` inicialmente; evaluar `onSnapshot` despues.

### Riesgo: conflicto entre datos locales y remotos

Mitigacion:

- Regla clara de merge.
- Rutinas: gana `updatedAt` mas reciente.
- Favoritos: union.
- Progreso: union por `id`.

## 15. Criterios de aceptacion

La migracion se considera exitosa si:

- Un usuario nuevo puede crear cuenta e iniciar sesion.
- Un usuario existente con datos locales puede migrarlos.
- No se pierden rutinas, favoritos ni progreso.
- La app funciona como invitado.
- La app funciona logueada.
- Los datos se sincronizan entre navegadores con la misma cuenta.
- Las reglas impiden acceder a datos de otros usuarios.
- `npm run build` pasa.
- Netlify despliega correctamente.
- No se reescriben las pantallas principales para depender directamente de Firebase.

## 16. Orden recomendado de Pull Requests

1. `firebase-setup`
   - instalar Firebase;
   - crear cliente Firebase;
   - agregar variables de entorno documentadas.

2. `firebase-auth`
   - agregar AuthProvider;
   - login/logout;
   - perfil basico de usuario.

3. `firestore-provider`
   - implementar FirebaseStorageProvider;
   - mantener LocalStorageProvider.

4. `local-to-firestore-migration`
   - backup local;
   - merge;
   - migracion idempotente.

5. `storage-provider-switch`
   - usar Firebase si hay usuario;
   - usar local si invitado.

6. `firestore-rules`
   - reglas;
   - pruebas de acceso.

7. `qa-and-polish`
   - estados de carga;
   - manejo de errores;
   - documentacion final.

## 17. Archivos que probablemente se agregaran

```text
lib/firebase/client.ts
lib/firebase/auth.ts
lib/storage/firebase-provider.ts
lib/storage/migration.ts
components/AuthProvider.tsx
components/LoginModal.tsx
components/UserMenu.tsx
firestore.rules
firebase.json
.env.example
```

## 18. Archivos que probablemente se modificaran

```text
package.json
package-lock.json
app/layout.tsx
app/page.tsx
app/library/page.tsx
app/builder/page.tsx
app/player/page.tsx
components/StorageProvider.tsx
lib/storage/provider.ts
types/index.ts
README.md
```

La meta es que la mayoria de paginas cambien lo minimo posible. Si una pagina empieza a importar Firestore directamente, la migracion esta perdiendo separacion de responsabilidades.

## 19. Verificacion de funcionalidad actual antes de empezar

Antes de tocar Firebase, registrar el comportamiento base:

- Crear una rutina local.
- Editar una rutina local.
- Marcar favoritos.
- Completar una rutina.
- Refrescar la pagina.
- Confirmar que todo persiste.
- Ejecutar `npm run build`.

Esto crea una linea base para comparar despues.

## 20. Referencias oficiales

- Firebase Authentication Web: https://firebase.google.com/docs/auth/web/start
- Cloud Firestore Security Rules: https://firebase.google.com/docs/firestore/security/get-started
- Secure data in Cloud Firestore: https://firebase.google.com/docs/firestore/security/overview
- Firebase Hosting with Next.js: https://firebase.google.com/docs/hosting/frameworks/nextjs
- Firebase App Hosting: https://firebase.google.com/docs/app-hosting

## 21. Recomendacion final

La migracion debe hacerse conservando `StorageProvider` como frontera. Ese contrato ya existe y es la mejor pieza del backend artesanal actual para transformar la app sin romperla.

La estrategia correcta es:

1. Login primero.
2. Firestore provider en paralelo.
3. Migracion local con backup.
4. Activacion por usuario autenticado.
5. Reglas de seguridad.
6. QA completa contra la funcionalidad actual.

Con este orden, GYMBEND gana login y sincronizacion sin sacrificar el uso actual como PWA local.
