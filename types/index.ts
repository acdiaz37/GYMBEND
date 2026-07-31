export type ExerciseType = "stretch" | "workout";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Exercise {
  id: string;
  title: string;
  type: ExerciseType;
  duration: number; // seconds for stretch; optional reference for workout
  image: string; // path to SVG
  muscles: string[];
  difficulty: Difficulty;
  instructions: string[];
  videoSlug?: string; // musclewiki slug for video URLs
}

export interface RoutineExercise {
  exerciseId: string;
  duration?: number; // override for stretch or timed workouts
  reps?: number; // for workout type
  sets?: number; // number of sets to perform (defaults to 1)
  order: number;
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  seedVersion?: number; // tracks default-routine template updates
}

export interface ProgressLog {
  id: string;
  routineId: string;
  completedAt: string; // ISO date
  duration: number; // total seconds
}

export interface Settings {
  favorites: string[]; // exercise ids
}
