import { Routine, ProgressLog, Settings } from "@/types";
import { StorageProvider } from "./provider";

const KEYS = {
  routines: "gymbend_routines",
  progress: "gymbend_progress",
  settings: "gymbend_settings",
};

export class LocalStorageProvider implements StorageProvider {
  private getItem<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // silently fail if storage is full or unavailable
    }
  }

  async getRoutines(): Promise<Routine[]> {
    return this.getItem<Routine[]>(KEYS.routines, []);
  }

  async saveRoutine(routine: Routine): Promise<void> {
    const routines = await this.getRoutines();
    const idx = routines.findIndex((r) => r.id === routine.id);
    if (idx >= 0) {
      routines[idx] = { ...routine, updatedAt: new Date().toISOString() };
    } else {
      routines.push({
        ...routine,
        createdAt: routine.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.setItem(KEYS.routines, routines);
  }

  async deleteRoutine(id: string): Promise<void> {
    const routines = await this.getRoutines();
    this.setItem(
      KEYS.routines,
      routines.filter((r) => r.id !== id)
    );
  }

  async getFavorites(): Promise<string[]> {
    const settings = await this.getSettings();
    return settings.favorites || [];
  }

  async toggleFavorite(exerciseId: string): Promise<boolean> {
    const settings = await this.getSettings();
    const favorites = new Set(settings.favorites || []);
    const isNowFavorite = !favorites.has(exerciseId);
    if (isNowFavorite) {
      favorites.add(exerciseId);
    } else {
      favorites.delete(exerciseId);
    }
    await this.saveSettings({ ...settings, favorites: Array.from(favorites) });
    return isNowFavorite;
  }

  async getProgress(): Promise<ProgressLog[]> {
    return this.getItem<ProgressLog[]>(KEYS.progress, []);
  }

  async logProgress(log: ProgressLog): Promise<void> {
    const logs = await this.getProgress();
    logs.push(log);
    this.setItem(KEYS.progress, logs);
  }

  async getSettings(): Promise<Settings> {
    return this.getItem<Settings>(KEYS.settings, { favorites: [] });
  }

  async saveSettings(settings: Settings): Promise<void> {
    this.setItem(KEYS.settings, settings);
  }
}

export const storageProvider = new LocalStorageProvider();
