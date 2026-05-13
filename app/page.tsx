"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { useStorage } from "@/components/StorageProvider";
import { Routine, ProgressLog } from "@/types";
import { useExercises } from "@/lib/useExercises";
import { motion } from "framer-motion";
import { Play, Heart, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekDays() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const mutedColors = [
  "bg-muted-teal/20",
  "bg-muted-pink/20",
  "bg-muted-purple/20",
  "bg-muted-beige/20",
  "bg-muted-darkblue/20",
];

export default function Home() {
  const router = useRouter();
  const storage = useStorage();
  const { exercises: allExercises, loading: exercisesLoading } = useExercises();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [progress, setProgress] = useState<ProgressLog[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    storage.getRoutines().then(setRoutines);
    storage.getProgress().then(setProgress);
    storage.getFavorites().then(setFavorites);
  }, [storage]);

  // Seed routines and clean up broken ones
  useEffect(() => {
    if (allExercises.length === 0) return;

    const seedRoutines = async () => {
      const existing = await storage.getRoutines();
      const validIds = new Set(allExercises.map((e) => e.id));

      // Remove routines with invalid exerciseIds
      for (const r of existing) {
        const hasInvalid = r.exercises.some(
          (ex) => !validIds.has(ex.exerciseId)
        );
        if (hasInvalid) {
          await storage.deleteRoutine(r.id);
        }
      }

      const cleaned = await storage.getRoutines();

      // Remove old seed routines if they exist
      for (const r of cleaned) {
        if (
          [
            "lower back",
            "test mix",
            "día 1 – superior + core",
            "día 2 – inferior + core",
            "día 3 – superior + core",
            "día 4 – inferior + core",
          ].includes(r.name.toLowerCase())
        ) {
          await storage.deleteRoutine(r.id);
        }
      }

      const final = await storage.getRoutines();

      // Lower Back stretch sequence
      const lowerBackExercises = [
        { exerciseId: "rag_doll", duration: 60, order: 0 },
        { exerciseId: "lunge", duration: 60, order: 1 },
        { exerciseId: "child_s_pose", duration: 60, order: 2 },
        { exerciseId: "cat_cow", duration: 60, order: 3 },
        { exerciseId: "thunderbolt", duration: 60, order: 4 },
        { exerciseId: "seated_fold", duration: 60, order: 5 },
        { exerciseId: "seated_straddle", duration: 60, order: 6 },
        { exerciseId: "knees_to_chest", duration: 60, order: 7 },
        { exerciseId: "lying_figure_four", duration: 60, order: 8 },
        { exerciseId: "happy_baby", duration: 60, order: 9 },
        { exerciseId: "legs_up_wall", duration: 60, order: 10 },
      ];

      // Cool Down stretch sequence
      const coolDownExercises = [
        { exerciseId: "child_s_pose", duration: 45, order: 0 },
        { exerciseId: "cat_cow", duration: 45, order: 1 },
        { exerciseId: "downward_dog", duration: 45, order: 2 },
        { exerciseId: "pigeon", duration: 45, order: 3 },
        { exerciseId: "spinal_twist", duration: 45, order: 4 },
        { exerciseId: "seated_fold", duration: 45, order: 5 },
        { exerciseId: "happy_baby", duration: 45, order: 6 },
        { exerciseId: "legs_up_wall", duration: 45, order: 7 },
      ];

      const dayRoutines = [
        {
          name: "Día 1 – Superior + Core",
          workouts: [
            { exerciseId: "kettlebell-floor-press", reps: 12, order: 0 },
            { exerciseId: "kettlebell-single-arm-row", reps: 12, order: 1 },
            { exerciseId: "kettlebell-push-press", reps: 12, order: 2 },
            { exerciseId: "kettlebell-situp", reps: 12, order: 3 },
            { exerciseId: "kettlebell-hollow-hold", reps: 20, order: 4 },
          ],
        },
        {
          name: "Día 2 – Inferior + Core",
          workouts: [
            { exerciseId: "kettlebell-goblet-squat", reps: 15, order: 0 },
            { exerciseId: "kettlebell-single-leg-deadlift", reps: 12, order: 1 },
            { exerciseId: "kettlebell-alternating-forward-lunge", reps: 12, order: 2 },
            { exerciseId: "kettlebell-glute-bridge", reps: 15, order: 3 },
            { exerciseId: "kettlebell-superman", reps: 12, order: 4 },
          ],
        },
        {
          name: "Día 3 – Superior + Core",
          workouts: [
            { exerciseId: "kettlebell-walkover-pushup", reps: 15, order: 0 },
            { exerciseId: "kettlebell-gorilla-row", reps: 12, order: 1 },
            { exerciseId: "kettlebell-seated-overhead-press", reps: 12, order: 2 },
            { exerciseId: "kettlebell-curl", reps: 15, order: 3 },
            { exerciseId: "kettlebell-russian-twist", reps: 20, order: 4 },
          ],
        },
        {
          name: "Día 4 – Inferior + Core",
          workouts: [
            { exerciseId: "kettlebell-step-up", reps: 12, order: 0 },
            { exerciseId: "kettlebell-assisted-bulgarian-split-squat", reps: 12, order: 1 },
            { exerciseId: "kettlebell-calf-raise", reps: 20, order: 2 },
            { exerciseId: "kettlebell-hip-thrust", reps: 15, order: 3 },
            { exerciseId: "kettlebell-windmill", reps: 12, order: 4 },
          ],
        },
      ];

      for (const day of dayRoutines) {
        if (!final.some((r) => r.name === day.name)) {
          const allExercises = [
            ...lowerBackExercises.map((e, i) => ({ ...e, order: i })),
            ...day.workouts.map((e, i) => ({
              ...e,
              order: lowerBackExercises.length + i,
            })),
            ...coolDownExercises.map((e, i) => ({
              ...e,
              order: lowerBackExercises.length + day.workouts.length + i,
            })),
          ];
          const routine: Routine = {
            id: crypto.randomUUID(),
            name: day.name,
            exercises: allExercises,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await storage.saveRoutine(routine);
        }
      }

      const updated = await storage.getRoutines();
      setRoutines(updated);
    };
    seedRoutines();
  }, [storage, allExercises]);

  const availableRoutines = routines
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const weekDays = getWeekDays();
  const weekProgress = weekDays.map((day) =>
    progress.some((p) => isSameDay(new Date(p.completedAt), day))
  );

  const favoriteExercises = allExercises.filter((ex) =>
    favorites.includes(ex.id)
  );

  const startRoutine = (routineId: string) => {
    router.push(`/player?routineId=${routineId}`);
  };

  const editRoutine = (routineId: string) => {
    router.push(`/builder?edit=${routineId}`);
  };

  const deleteRoutine = async (routineId: string) => {
    await storage.deleteRoutine(routineId);
    const updated = await storage.getRoutines();
    setRoutines(updated);
  };

  if (exercisesLoading) {
    return (
      <AppShell header={<Header title="GYMBEND" />}>
        <div className="flex items-center justify-center h-full text-gray-subtitle text-sm">
          Loading...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell header={<Header title="GYMBEND" />}>
      <div className="px-6 pb-8 space-y-10">
        {/* Weekly progress */}
        <section>
          <h2 className="text-gray-subtitle text-xs font-semibold uppercase tracking-widest mb-4">
            This Week
          </h2>
          <div className="flex items-end justify-between gap-2">
            {weekDays.map((day, idx) => {
              const isActive = weekProgress[idx];
              const isToday = isSameDay(day, new Date());
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: isActive ? 32 : 8 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className={cn(
                      "w-2 rounded-full",
                      isActive ? "bg-accent-blue" : "bg-white/10"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium uppercase",
                      isToday ? "text-white" : "text-gray-subtitle"
                    )}
                  >
                    {DAYS[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* All Routines */}
        <section>
          <h2 className="text-gray-subtitle text-xs font-semibold uppercase tracking-widest mb-4">
            All Routines
          </h2>
          {availableRoutines.length > 0 ? (
            <div className="space-y-1">
              {availableRoutines.map((routine) => (
                <div
                  key={routine.id}
                  className="flex items-center w-full py-3 gap-3"
                >
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => startRoutine(routine.id)}
                    className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center shrink-0"
                  >
                    <Play
                      className="w-4 h-4 text-accent-blue ml-0.5"
                      strokeWidth={1.5}
                      fill="currentColor"
                    />
                  </motion.button>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-base truncate">
                      {routine.name}
                    </p>
                    <p className="text-gray-subtitle text-xs">
                      {routine.exercises.length} exercises
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => editRoutine(routine.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-subtitle hover:text-white"
                    >
                      <Pencil className="w-4 h-4" strokeWidth={1.5} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => deleteRoutine(routine.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-subtitle hover:text-accent-red"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-subtitle text-sm py-4">
              No routines yet. Create your first one.
            </p>
          )}
        </section>

        {/* Favorites */}
        {favoriteExercises.length > 0 && (
          <section>
            <h2 className="text-gray-subtitle text-xs font-semibold uppercase tracking-widest mb-4">
              Favorites
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {favoriteExercises.map((ex, index) => {
                const colorClass = mutedColors[index % mutedColors.length];
                return (
                  <button
                    key={ex.id}
                    className="flex flex-col items-center gap-2 min-w-[72px]"
                  >
                    <div
                      className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center",
                        colorClass
                      )}
                    >
                      <Heart
                        className="w-5 h-5 text-accent-red fill-accent-red"
                        strokeWidth={1.5}
                      />
                    </div>
                    <span className="text-white text-[11px] font-medium text-center leading-tight">
                      {ex.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="pt-4">
          <Button onClick={() => router.push("/builder")} variant="primary">
            Create Routine
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
