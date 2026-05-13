# GYMBEND

GYMBEND is a mobile-first fitness PWA for building and following mobility, stretching, and kettlebell routines. It combines an exercise library, a routine builder, a workout player, favorites, and weekly progress tracking in a clean app-style interface.

The project is built with Next.js, React, TypeScript, Tailwind CSS, Framer Motion, and local browser storage.

## What It Does

- Shows a home dashboard with recent routines, favorites, and weekly completion progress.
- Includes a searchable exercise library with 306 stretch and workout movements.
- Filters exercises by type and difficulty.
- Lets users mark exercises as favorites.
- Lets users create, edit, reorder, and delete custom routines.
- Supports timed stretches and rep-based workout exercises.
- Plays routines step by step with timers, rest periods, progress rings, exercise illustrations, instructions, and optional video links.
- Logs completed routines locally so the weekly progress indicator can update.
- Seeds four default kettlebell routines that combine warm-up/mobility, strength work, and cool-down blocks.
- Works as a PWA with app manifest, icons, service worker registration, and portrait standalone mode.

## Main Screens

- `/` - Home dashboard with weekly progress, recent routines, favorites, and create-routine action.
- `/library` - Exercise library with search, filters, illustrations, durations/reps, and favorites.
- `/builder` - Routine builder for creating a new routine.
- `/builder?edit=<routineId>` - Routine editor for existing routines.
- `/player?routineId=<routineId>` - Guided workout player.

## Data And Storage

Exercise data lives in `data/exercises.json`. Each exercise includes:

- id and title
- type: `stretch` or `workout`
- default duration
- illustration path
- target muscles
- difficulty
- instructions
- optional MuscleWiki video slug

User-created data is stored in `localStorage` through `lib/storage/local-provider.ts`:

- `gymbend_routines` - saved routines
- `gymbend_progress` - completed workout logs
- `gymbend_settings` - favorites and app settings

There is no backend yet; the app currently runs fully on the client.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React icons
- LocalStorage-based persistence
- PWA manifest and static assets in `public/`

## Project Structure

```text
app/                  Next.js routes and pages
components/           Shared app UI components
data/                 Exercise database
lib/storage/          Storage provider abstraction and localStorage implementation
public/               PWA icons, service worker, and exercise illustrations
scripts/              Data/import/generation helper scripts
types/                Shared TypeScript types
Principios/           Product and design notes
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Start the production build:

```bash
npm run start
```

Run linting:

```bash
npm run lint
```

## Current Status

The app is close to MVP completion. The main user flows are in place: browsing exercises, saving favorites, creating routines, editing routines, playing workouts, and tracking completions locally.

Good next steps would be polishing copy/encoding issues in some default routine names, adding tests around storage and routine playback, and deciding whether future user data should stay local or move to a backend.
