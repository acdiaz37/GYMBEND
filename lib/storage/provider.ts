import { Routine, ProgressLog, Settings } from "@/types";

export interface StorageProvider {
  // Routines
  getRoutines(): Promise<Routine[]>;
  saveRoutine(routine: Routine): Promise<void>;
  deleteRoutine(id: string): Promise<void>;

  // Favorites
  getFavorites(): Promise<string[]>;
  toggleFavorite(exerciseId: string): Promise<boolean>;

  // Progress
  getProgress(): Promise<ProgressLog[]>;
  logProgress(log: ProgressLog): Promise<void>;

  // Settings
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;
}
