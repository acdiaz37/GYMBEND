import { ProgressLog, Routine, Settings } from "@/types";
import { StorageProvider } from "./provider";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

const SETTINGS_ID = "main";

export class FirebaseStorageProvider implements StorageProvider {
  constructor(private readonly uid: string) {}

  private userDoc() {
    return doc(db, "users", this.uid);
  }

  private routinesCollection() {
    return collection(this.userDoc(), "routines");
  }

  private routineDoc(id: string) {
    return doc(this.routinesCollection(), id);
  }

  private progressCollection() {
    return collection(this.userDoc(), "progress");
  }

  private progressDoc(id: string) {
    return doc(this.progressCollection(), id);
  }

  private settingsDoc() {
    return doc(this.userDoc(), "settings", SETTINGS_ID);
  }

  async getRoutines(): Promise<Routine[]> {
    const snapshot = await getDocs(this.routinesCollection());
    return snapshot.docs.map((item) => item.data() as Routine);
  }

  async saveRoutine(routine: Routine): Promise<void> {
    const now = new Date().toISOString();
    const existing = await getDoc(this.routineDoc(routine.id));
    await setDoc(
      this.routineDoc(routine.id),
      {
        ...routine,
        createdAt:
          routine.createdAt ||
          ((existing.exists() ? existing.data().createdAt : undefined) as string | undefined) ||
          now,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  async deleteRoutine(id: string): Promise<void> {
    await deleteDoc(this.routineDoc(id));
  }

  async getFavorites(): Promise<string[]> {
    const settings = await this.getSettings();
    return settings.favorites || [];
  }

  async toggleFavorite(exerciseId: string): Promise<boolean> {
    return runTransaction(db, async (transaction) => {
      const settingsRef = this.settingsDoc();
      const snapshot = await transaction.get(settingsRef);
      const settings = snapshot.exists()
        ? (snapshot.data() as Settings)
        : { favorites: [] };
      const favorites = new Set(settings.favorites || []);
      const isNowFavorite = !favorites.has(exerciseId);

      if (isNowFavorite) {
        favorites.add(exerciseId);
      } else {
        favorites.delete(exerciseId);
      }

      transaction.set(
        settingsRef,
        { ...settings, favorites: Array.from(favorites), updatedAt: new Date().toISOString() },
        { merge: true }
      );

      return isNowFavorite;
    });
  }

  async getProgress(): Promise<ProgressLog[]> {
    const snapshot = await getDocs(this.progressCollection());
    return snapshot.docs.map((item) => item.data() as ProgressLog);
  }

  async logProgress(log: ProgressLog): Promise<void> {
    await setDoc(this.progressDoc(log.id), log, { merge: true });
  }

  async getSettings(): Promise<Settings> {
    const snapshot = await getDoc(this.settingsDoc());
    return snapshot.exists() ? (snapshot.data() as Settings) : { favorites: [] };
  }

  async saveSettings(settings: Settings): Promise<void> {
    await setDoc(
      this.settingsDoc(),
      { ...settings, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  }
}
