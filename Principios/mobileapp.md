Construye una aplicación web mobile-first premium para ejercicios de stretching y ejercicios en casa. La aplicación debe sentirse como una app nativa minimalista de wellness premium y seguir EXACTAMENTE los patrones de diseño especificados abajo.

━━━━━━━━━━━━━━━━━━
OBJETIVO DE LA APP
━━━━━━━━━━━━━━━━━━

La app es una aplicación PERSONAL para:
- guardar ejercicios
- construir rutinas manualmente
- ejecutar rutinas
- trackear progreso básico

NO es:
- una red social
- una SaaS multiusuario
- una plataforma fitness compleja
- una app gamificada

La filosofía debe ser:
- simplicidad extrema
- UX limpia
- mobile-only
- rápida
- calmada
- enfocada
- minimalista
- offline-first

━━━━━━━━━━━━━━━━━━
STACK TECNOLÓGICO
━━━━━━━━━━━━━━━━━━

Usar:
- Next.js 14
- App Router
- TypeScript
- TailwindCSS
- Framer Motion

NO usar:
- Firebase
- Supabase
- backend complejo
- autenticación
- APIs externas innecesarias

━━━━━━━━━━━━━━━━━━
ARQUITECTURA
━━━━━━━━━━━━━━━━━━

La aplicación debe estar construida para funcionar COMPLETAMENTE LOCAL usando:
- localStorage
- JSON local

PERO debe diseñarse con arquitectura desacoplada para que en el futuro pueda conectarse fácilmente a:
- Firebase
- Supabase
- cualquier backend

IMPORTANTE:
Nunca acceder localStorage directamente desde componentes.

Crear una arquitectura tipo provider:

/lib/storage
  provider.ts
  local-provider.ts

Toda la app debe interactuar únicamente con:

storageProvider.getRoutines()
storageProvider.saveRoutine()

etc.

TODO debe ser async desde el inicio.

Ejemplo:

const routines = await storageProvider.getRoutines();

Aunque internamente use localStorage.

━━━━━━━━━━━━━━━━━━
ESTRUCTURA DE DATOS
━━━━━━━━━━━━━━━━━━

Los ejercicios deben vivir en:

/data/exercises.json

Ejemplo de Exercise:

{
  "id": "hamstring_stretch",
  "title": "Hamstring Stretch",
  "type": "stretch",
  "duration": 60,
  "image": "/illustrations/hamstring.svg",
  "muscles": ["hamstrings"],
  "difficulty": "beginner",
  "instructions": [
    "Keep your legs straight",
    "Breathe deeply"
  ]
}

La app debe incluir solamente:
- 2 o 3 ejercicios de ejemplo
- estructura lista para escalar

━━━━━━━━━━━━━━━━━━
TIPOS DE EJERCICIO
━━━━━━━━━━━━━━━━━━

Existen 2 tipos:

1. Stretching
- usan timer
- duración en segundos

2. Ejercicios físicos
- usan repeticiones
- opcionalmente duración

La UI debe adaptarse automáticamente según el tipo.

━━━━━━━━━━━━━━━━━━
PERSISTENCIA
━━━━━━━━━━━━━━━━━━

Guardar localmente:
- rutinas
- favoritos
- progreso semanal
- historial simple
- configuraciones

Usar:
- localStorage inicialmente

Diseñar para futura migración a backend.

━━━━━━━━━━━━━━━━━━
PLATAFORMA
━━━━━━━━━━━━━━━━━━

La app debe ser:
- mobile-only
- responsive únicamente para mobile

Aunque se abra en desktop:
- debe seguir viéndose como app mobile
- NO debe expandirse a full desktop layout

Usar container centrado:

max-width: 430px;
margin: auto;
height: 100vh;

━━━━━━━━━━━━━━━━━━
PWA
━━━━━━━━━━━━━━━━━━

La app debe comportarse como una PWA:
- instalable
- fullscreen
- experiencia app-like
- offline-friendly

━━━━━━━━━━━━━━━━━━
PANTALLAS PRINCIPALES
━━━━━━━━━━━━━━━━━━

La app debe tener SOLO 4 pantallas principales.

━━━━━━━━━
1. HOME
━━━━━━━━━

Minimalista.

Mostrar:
- rutinas recientes
- progreso semanal
- botón crear rutina
- favoritos

Diseño:
- limpio
- mucho espacio negativo
- estilo editorial premium

━━━━━━━━━
2. EXERCISE LIBRARY
━━━━━━━━━

Pantalla más importante.

Debe incluir:
- lista minimalista de ejercicios
- búsqueda
- filtros simples
- categorías
- tap para agregar

Diseño:
- inspirado exactamente en las screenshots
- lista vertical minimalista
- ilustración circular
- nombre ejercicio
- controles compactos

━━━━━━━━━
3. ROUTINE BUILDER
━━━━━━━━━

Builder minimal tipo:
- Apple Reminders
- Notion minimal
- Linear

NO hacer:
- Trello complejo
- múltiples columnas
- dashboard

Debe permitir:
- agregar ejercicios
- editar duración/repeticiones
- drag and drop vertical
- reordenar ejercicios
- guardar rutina

Flujo:
- agregar rápido
- editar después

━━━━━━━━━
4. WORKOUT PLAYER
━━━━━━━━━

Pantalla inspirada EXACTAMENTE en las screenshots.

Debe incluir:
- progreso actual
- timer grande
- progress ring
- imagen ejercicio
- controles minimalistas
- next/previous
- pausa

Si ejercicio es stretch:
- mostrar timer

Si ejercicio es rep:
- mostrar repeticiones

Debe avanzar automáticamente al terminar timer.

━━━━━━━━━━━━━━━━━━
ESTILO VISUAL GENERAL
━━━━━━━━━━━━━━━━━━

- Fondo completamente negro profundo (#000000).
- Estética cinematic dark UI.
- Sensación premium, limpia y silenciosa.
- Diseño extremadamente minimalista.
- Mucho espacio negativo.
- Jerarquía visual basada en tamaño y contraste.
- Nada de bordes visibles.
- Nada de cards tradicionales.
- Todo debe sentirse suave, redondeado y táctil.

Inspiración:
- Apple Fitness
- Calm
- Nike Training Club dark mode
- apps premium wellness

━━━━━━━━━━━━━━━━━━
SISTEMA DE COLOR
━━━━━━━━━━━━━━━━━━

FONDO
- negro absoluto

TEXTOS
- blanco puro títulos
- gris medio subtítulos
- gris claro timers

ACCENTS
- azul vibrante CTA principal
- rojo suave favoritos

ILUSTRACIONES
- colores muted pastel
- verde petróleo
- rosa muted
- morado suave
- beige cálido
- azul oscuro

━━━━━━━━━━━━━━━━━━
TIPOGRAFÍA
━━━━━━━━━━━━━━━━━━

- Sans serif moderna
- Bold/Semibold
- Títulos grandes
- Tracking ligeramente cerrado

TIMERS:
- enormes
- bold
- máxima jerarquía visual

━━━━━━━━━━━━━━━━━━
PATRONES DE LAYOUT
━━━━━━━━━━━━━━━━━━

- columna central
- alineación limpia
- espaciado constante
- mucho aire
- padding horizontal amplio (~24px)

Separadores:
- líneas sutiles
- gris oscuro
- opacidad baja

━━━━━━━━━━━━━━━━━━
HEADER PATTERN
━━━━━━━━━━━━━━━━━━

Barra superior minimalista.

IZQUIERDA
- icono simple

CENTRO
- título bold

DERECHA
- icono menú minimal

━━━━━━━━━━━━━━━━━━
LIST ITEMS
━━━━━━━━━━━━━━━━━━

Cada ejercicio debe mostrar:

IZQUIERDA
- ilustración circular
- fondo muted
- SVG flat minimal

CENTRO
- nombre ejercicio
- subtítulo opcional

DERECHA
- duración o reps
- botón agregar

━━━━━━━━━━━━━━━━━━
CTA PRINCIPAL
━━━━━━━━━━━━━━━━━━

Botón:
- full width
- azul vibrante
- bordes muy redondeados
- uppercase
- bold
- táctil
- sin sombras agresivas

━━━━━━━━━━━━━━━━━━
PROGRESS RING
━━━━━━━━━━━━━━━━━━

- grande
- grueso
- minimalista
- gris oscuro
- segmento activo claro
- ilustración dentro del círculo

━━━━━━━━━━━━━━━━━━
ILUSTRACIONES
━━━━━━━━━━━━━━━━━━

Usar:
- SVG
- flat illustration
- sin realismo
- sin textura
- formas geométricas suaves
- estilo editorial moderno
- personajes simplificados

NO usar:
- imágenes realistas
- gradients fuertes
- sombras complejas

━━━━━━━━━━━━━━━━━━
MICROINTERACCIONES
━━━━━━━━━━━━━━━━━━

- animaciones suaves
- ease-in-out
- transiciones lentas
- feedback táctil
- escalado ligero al tocar
- progress ring animado

━━━━━━━━━━━━━━━━━━
COMPONENTES
━━━━━━━━━━━━━━━━━━

BOTONES
- totalmente redondeados
- alto contraste
- minimalistas

CARDS
- evitar cards tradicionales
- usar espacio como separación

ICONOS
- line icons
- minimalistas
- blancos/grises

━━━━━━━━━━━━━━━━━━
ESTRUCTURA DE ARCHIVOS
━━━━━━━━━━━━━━━━━━

/app
/components
/data
  exercises.json
/lib
  /storage
    provider.ts
    local-provider.ts
/types
/public
  /illustrations

━━━━━━━━━━━━━━━━━━
EXPERIENCIA FINAL
━━━━━━━━━━━━━━━━━━

La aplicación debe sentirse:
- premium
- moderna
- calmada
- inmersiva
- silenciosa
- rápida
- táctil
- elegante
- minimalista extrema

La experiencia debe parecer una mezcla entre:
- Apple Fitness
- Calm
- Nike Training Club
- una app editorial de wellness premium

NO construir:
- dashboards complejos
- layouts desktop
- sidebars
- múltiples columnas
- UI empresarial
- diseño cargado
- exceso de texto
- widgets innecesarios
- complejidad innecesaria

Priorizar SIEMPRE:
- simplicidad
- facilidad de crear rutinas
- UX limpia
- velocidad
- experiencia mobile premium.