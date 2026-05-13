# Roadmap de Desarrollo — Stretch & Home Workout App

> Guía paso a paso para construir la aplicación mobile-first siguiendo desarrollo ágil. Cada fase es un entregable vertical funcional. **No se incluye testeo** como fase dedicada; la calidad se valida en cada entrega.

---

## Fase 1 — Fundamentos y Setup del Proyecto

**Objetivo:** Tener el esqueleto del proyecto corriendo con la configuración base correcta.

- Inicializar proyecto con **Next.js 14 + App Router + TypeScript**.
- Configurar **TailwindCSS** con los tokens iniciales de color (fondo negro absoluto, grises, azul vibrante CTA).
- Instalar dependencias: `framer-motion`, `lucide-react` (iconografía lineal).
- Configurar **PWA base**: `manifest.json`, `metadata` para viewport móvil, tema oscuro forzado.
- Crear estructura de carpetas propuesta:
  ```
  /app
  /components
  /data
  /lib/storage
  /types
  /public/illustrations
  ```
- Validar que el servidor levanta y el layout base renderiza en negro #000000.

**Entregable:** Proyecto corriendo en `localhost:3000` con pantalla negra y PWA configurable.

---

## Fase 2 — Sistema de Diseño y Layout Atómico

**Objetivo:** Establecer el lenguaje visual y el contenedor mobile-before-anything.

- Implementar el **Mobile Container** centralizado:
  - `max-width: 430px`, `margin: auto`, `height: 100vh`, fondo negro absoluto.
  - En desktop debe verse como app centrada, nunca expandirse.
- Crear tokens de diseño Tailwind personalizados:
  - Colores: fondo, textos (blanco/grises), acentos (azul vibrante, rojo suave favoritos).
  - Tipografía: sans-serif moderna, títulos grandes bold, timers enormes.
  - Espaciado: padding horizontal amplio (~24px), aire generoso entre elementos.
- Componentes atómicos mínimos:
  - `Button` (full-width, azul vibrante, bordes muy redondeados, uppercase, bold).
  - `Header` (izquierda: icono simple | centro: título bold | derecha: icono menú).
  - `ListItem` (ilustración circular + nombre + duración/reps + botón agregar).
  - `IconButton` (line icons, blancos/grises, feedback táctil).

**Entregable:** Storyboard visual o pantalla de prueba con todos los tokens aplicados y componentes base renderizando correctamente.

---

## Fase 3 — Tipos y Estructura de Datos

**Objetivo:** Definir el contrato de datos que gobernará toda la aplicación.

- Crear `/types/index.ts` con interfaces TypeScript:
  - `Exercise` (id, title, type: `'stretch' | 'workout'`, duration, image, muscles, difficulty, instructions).
  - `Routine` (id, name, exercises: `RoutineExercise[]`, createdAt).
  - `RoutineExercise` (exerciseId, duration?, reps?, order).
  - `ProgressLog` (routineId, completedAt, duration).
  - `Settings` (favoritos, preferencias mínimas).
- Definir `/data/exercises.json` con 2-3 ejercicios de ejemplo reales que cubran ambos tipos (stretch + workout).
- Validar que el JSON cumple la interfaz `Exercise`.
- Documentar decisiones: por qué ciertos campos son opcionales, por qué se separa `RoutineExercise` de `Exercise`.

**Entregable:** Archivos de tipos listos y JSON validado; la app puede importar y leer los ejercicios sin errores de tipo.

---

## Fase 4 — Arquitectura de Persistencia (Provider Pattern)

**Objetivo:** Toda la app habla con una sola abstracción, lista para migrar a backend sin tocar componentes.

- Crear `/lib/storage/provider.ts`:
  - Interfaz `StorageProvider` con métodos async:
    - `getRoutines()`, `saveRoutine()`, `deleteRoutine()`.
    - `getFavorites()`, `toggleFavorite()`.
    - `getProgress()`, `logProgress()`.
    - `getSettings()`, `saveSettings()`.
- Implementar `/lib/storage/local-provider.ts`:
  - Usa `localStorage` internamente pero expone todo como `async/await`.
  - Serialización/deserialización segura con JSON.
  - Manejo básico de errores (fallbacks si localStorage no está disponible).
- Crear hook/contexto `useStorage()` para que los componentes consuman el provider sin saber qué hay detrás.
- **Regla de oro:** Ningún componente importa `localStorage` directamente.

**Entregable:** Provider funcional; se puede probar desde consola o un componente temporal que guarde y recupere rutinas.

---

## Fase 5 — Shell de Navegación y Routing

**Objetivo:** La app tiene 4 pantallas navegables con flujo mobile nativo.

- Implementar el routing en App Router para 4 rutas principales:
  - `/` — Home
  - `/library` — Exercise Library
  - `/builder` — Routine Builder
  - `/player` — Workout Player
- Crear layout raíz con navegación inferior minimalista (tab bar) o navegación gestual entre las 3 principales (Home, Library, Builder). Player se abre como pantalla a pantalla completa desde Builder o Home.
- Transiciones entre pantallas con **Framer Motion** (slide horizontal suave, fade).
- Asegurar que cada pantalla vive dentro del contenedor mobile de 430px.
- Header adaptable por pantalla (título bold centrado, iconos laterales contextuales).

**Entregable:** Navegación fluida entre 4 pantallas vacías pero con headers y transiciones correctas.

---

## Fase 6 — Biblioteca de Ejercicios (Exercise Library)

**Objetivo:** La pantalla más importante completamente funcional.

- Renderizar lista vertical minimalista desde `/data/exercises.json`.
- Cada item: ilustración circular (SVG placeholder inicialmente), nombre del ejercicio, tipo, duración/reps, botón agregar/toggle favorito.
- Implementar **búsqueda en tiempo real** por nombre y músculo.
- Implementar **filtros simples**: por tipo (Stretch / Workout) y dificultad.
- Implementar **favoritos**: toggle con corazón rojo suave, persistido vía provider.
- Diseño: espacio como separación (no cards tradicionales), líneas divisorias sutiles gris oscuro, mucho aire.

**Entregable:** Pantalla Library funcional con búsqueda, filtros y favoritos persistidos.

---

## Fase 7 — Constructor de Rutinas (Routine Builder)

**Objetivo:** Flujo minimal para armar rutinas rápidamente.

- Diseñar UI tipo Apple Reminders / Notion minimal / Linear:
  - Lista vertical de ejercicios agregados.
  - Cada fila editable: duración o repeticiones según tipo.
  - Drag & drop vertical para reordenar (usar librería ligera compatible con mobile o implementación nativa con hooks táctiles).
- Flujo de agregado:
  - Desde Library, tap en "Agregar" abre selector rápido o redirige a builder con ejercicio pre-cargado.
  - En Builder, botón para "Agregar ejercicio" que abre Library en modo selección.
- Acciones por rutina:
  - Guardar (con nombre editable).
  - Descartar cambios.
  - Eliminar ejercicio de la lista (swipe o botón sutil).
- Persistir rutina completa vía `storageProvider.saveRoutine()`.

**Entregable:** Se puede crear, editar, reordenar y guardar una rutina completa con ejercicios mixtos.

---

## Fase 8 — Home Dashboard

**Objetivo:** Pantalla de inicio con información útil y acceso rápido.

- Sección **Rutinas Recientes**: lista horizontal o vertical compacta de las últimas 3 rutinas usadas, tap para abrir Player directamente.
- Sección **Progreso Semanal**: visualización minimal del historial de sesiones completadas (barras sutiles, puntos, o anillo parcial; no dashboard complejo).
- Sección **Favoritos Rápidos**: ejercicios marcados como favorito, acceso directo.
- **CTA Principal** (full-width, azul vibrante): "Crear Rutina" → lleva a Builder vacío.
- Diseño editorial premium: mucho espacio negativo, jerarquía por tamaño, sin ruido.
- Datos alimentados desde el provider (rutinas guardadas, favoritos, logs de progreso).

**Entregable:** Home renderiza datos reales del usuario y permite iniciar rutinas o crear nuevas.

---

## Fase 9 — Workout Player

**Objetivo:** La experiencia de ejecución, inmersiva y táctil.

- Pantalla a pantalla completa dentro del contenedor mobile.
- Elementos visuales:
  - **Progress Ring** grande y grueso (gris oscuro base, segmento activo claro), animado.
  - **Timer enorme y bold** con máxima jerarquía visual.
  - Ilustración del ejercicio actual dentro o sobre el círculo.
  - Nombre del ejercicio, instrucciones breves.
  - Controles minimalistas: play/pausa, anterior, siguiente.
- Lógica por tipo:
  - **Stretch:** cuenta regresiva visual, al llegar a 0 avanza automáticamente al siguiente ejercicio.
  - **Workout:** muestra repeticiones objetivo, botón "Listo / Siguiente" manual (no timer obligatorio, aunque puede tener duración opcional).
- Progreso general: indicador sutil de "ejercicio X de Y".
- Al finalizar rutina: pantalla de cierre minimal con resumen (tiempo total, ejercicios completados) y log de progreso guardado automáticamente vía provider.

**Entregable:** Se puede reproducir una rutina completa de principio a fin con timers funcionales y avance automático.

---

## Fase 10 — Pulido Visual, Microinteracciones y PWA Final

**Objetivo:** La app se siente premium, nativa y lista para instalarse.

- **Microinteracciones con Framer Motion:**
  - Escalado ligero al tocar botones (`whileTap={{ scale: 0.97 }}`).
  - Transiciones suaves ease-in-out entre estados.
  - Animación del Progress Ring sincronizada con el timer.
  - Entrada/salida de elementos de lista con stagger suave.
- **Ilustraciones SVG:** reemplazar placeholders por SVGs flat minimalistas (2-3 iniciales), validar estilo (colores muted pastel, formas geométricas suaves).
- **PWA hardening:**
  - Íconos y splash screens para iOS/Android.
  - Service worker básico para offline (al menos cache de shell y datos locales).
  - Comportamiento fullscreen, standalone, sin barra de navegador del browser.
- **Calidad visual final:**
  - Revisar que no haya bordes visibles innecesarios.
  - Verificar contrastes y jerarquía tipográfica en todas las pantallas.
  - Asegurar que en desktop se vea exactamente como app mobile centrada.

**Entregable:** Aplicación instalable, con animaciones pulidas, ilustraciones SVG integradas y experiencia premium consistente en todas las pantallas.

---

## Principios Ágiles Aplicados

1. **Entregas verticales:** cada fase produce valor visible y funcional, no capas técnicas aisladas.
2. **Minimalismo evolutivo:** no se construye nada que no esté en los requerimientos; escalabilidad se prepara en arquitectura, no en features.
3. **Data-first:** la Fase 3 (tipos) y Fase 4 (provider) son bloqueantes para las demás, pero una vez listas el desarrollo de UI es paralelizable.
4. **UX como north star:** cualquier decisión técnica se subordina a la sensación calmada, silenciosa y premium de la app.
5. **Sin testeo formal:** la validación ocurre en cada fase mediante uso real en dispositivo mobile o emulador; si algo no se siente bien, se itera antes de avanzar.

---

## Checklist de Dependencias entre Fases

| Fase | Bloqueada por | Puede paralelizarse con |
|------|---------------|------------------------|
| 1 Setup | — | — |
| 2 Sistema de Diseño | 1 | — |
| 3 Tipos y Datos | 1 | 2 |
| 4 Provider | 3 | 2 |
| 5 Shell y Routing | 2, 4 | — |
| 6 Library | 3, 4, 5 | — |
| 7 Builder | 3, 4, 5, 6 | — |
| 8 Home | 4, 5, 6, 7 | — |
| 9 Player | 4, 5, 6, 7 | — |
| 10 Pulido | Todas las anteriores | — |
