import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { FirebaseStorageProvider } from "./firebase-provider";
import { LocalStorageProvider } from "./local-provider";
import { ProgressLog, Routine, Settings } from "@/types";

const MIGRATION_VERSION = 1;
const BACKUP_KEY = "gymbend_backup_before_firebase_migration";

interface MigrationBackup {
  createdAt: string;
  routines: Routine[];
  progress: ProgressLog[];
  settings: Settings;
}

function byId<T extends { id: string }>(items: T[]) {
  return new Map(items.map((item) => [item.id, item]));
}

function mergeRoutines(local: Routine[], remote: Routine[]) {
  const merged = byId(remote);

  for (const routine of local) {
    const existing = merged.get(routine.id);
    if (!existing) {
      merged.set(routine.id, routine);
      continue;
    }

    const localTime = new Date(routine.updatedAt || routine.createdAt).getTime();
    const remoteTime = new Date(existing.updatedAt || existing.createdAt).getTime();
    if (localTime > remoteTime) {
      merged.set(routine.id, routine);
    }
  }

  return Array.from(merged.values());
}

function mergeProgress(local: ProgressLog[], remote: ProgressLog[]) {
  return Array.from(new Map([...remote, ...local].map((log) => [log.id, log])).values());
}

function mergeSettings(local: Settings, remote: Settings) {
  return {
    ...remote,
    ...local,
    favorites: Array.from(new Set([...(remote.favorites || []), ...(local.favorites || [])])),
  };
}

function writeBackup(backup: MigrationBackup) {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem(BACKUP_KEY);
  if (!existing) {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
  }
}

export async function migrateLocalStorageToFirebase(uid: string) {
  const profileRef = doc(db, "users", uid);
  const profile = await getDoc(profileRef);
  const profileData = profile.exists() ? profile.data() : {};

  if (profileData.migrationVersion >= MIGRATION_VERSION) {
    return;
  }

  const localProvider = new LocalStorageProvider();
  const firebaseProvider = new FirebaseStorageProvider(uid);

  const [localRoutines, localProgress, localSettings] = await Promise.all([
    localProvider.getRoutines(),
    localProvider.getProgress(),
    localProvider.getSettings(),
  ]);

  writeBackup({
    createdAt: new Date().toISOString(),
    routines: localRoutines,
    progress: localProgress,
    settings: localSettings,
  });

  const [remoteRoutines, remoteProgress, remoteSettings] = await Promise.all([
    firebaseProvider.getRoutines(),
    firebaseProvider.getProgress(),
    firebaseProvider.getSettings(),
  ]);

  const routines = mergeRoutines(localRoutines, remoteRoutines);
  const progress = mergeProgress(localProgress, remoteProgress);
  const settings = mergeSettings(localSettings, remoteSettings);

  await Promise.all([
    ...routines.map((routine) => firebaseProvider.saveRoutine(routine)),
    ...progress.map((log) => firebaseProvider.logProgress(log)),
    firebaseProvider.saveSettings(settings),
  ]);

  const [confirmedRoutines, confirmedProgress, confirmedSettings] = await Promise.all([
    firebaseProvider.getRoutines(),
    firebaseProvider.getProgress(),
    firebaseProvider.getSettings(),
  ]);

  if (
    confirmedRoutines.length < routines.length ||
    confirmedProgress.length < progress.length ||
    (confirmedSettings.favorites || []).length < (settings.favorites || []).length
  ) {
    throw new Error("Firebase migration verification failed");
  }

  await setDoc(
    profileRef,
    {
      migratedFromLocalStorage: true,
      migrationVersion: MIGRATION_VERSION,
      migrationCompletedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
