"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { useStorage } from "@/components/StorageProvider";
import { Exercise, Routine, RoutineExercise } from "@/types";
import exercisesData from "@/data/exercises.json";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const allExercises: Exercise[] = exercisesData as Exercise[];

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storage = useStorage();
  const editId = searchParams.get("edit");

  const [name, setName] = useState("New Routine");
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerFilter, setPickerFilter] = useState<"all" | "stretch" | "workout">("all");
  const [isEditing, setIsEditing] = useState(false);

  // Load existing routine if editing
  useEffect(() => {
    if (!editId) return;
    storage.getRoutines().then((routines) => {
      const existing = routines.find((r) => r.id === editId);
      if (existing) {
        setName(existing.name);
        setExercises(existing.exercises);
        setIsEditing(true);
      }
    });
  }, [editId, storage]);

  const addExercise = useCallback((exercise: Exercise) => {
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: exercise.id,
        duration: exercise.type === "stretch" ? exercise.duration : undefined,
        reps: exercise.type === "workout" ? 12 : undefined,
        order: prev.length,
      },
    ]);
    setShowPicker(false);
  }, []);

  const removeExercise = useCallback((index: number) => {
    setExercises((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((ex, i) => ({ ...ex, order: i }))
    );
  }, []);

  const moveExercise = useCallback((index: number, direction: -1 | 1) => {
    setExercises((prev) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next.map((ex, i) => ({ ...ex, order: i }));
    });
  }, []);

  const updateField = useCallback(
    (index: number, field: "duration" | "reps", value: number) => {
      setExercises((prev) =>
        prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
      );
    },
    []
  );

  const saveRoutine = async () => {
    if (exercises.length === 0) return;
    const routine: Routine = {
      id: isEditing && editId ? editId : crypto.randomUUID(),
      name: name.trim() || "Untitled Routine",
      exercises,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await storage.saveRoutine(routine);
    router.push("/");
  };

  const exerciseMap = new Map(allExercises.map((e) => [e.id, e]));

  return (
    <AppShell
      header={<Header title={isEditing ? "Edit Routine" : "Routine Builder"} />}
      showNav={!showPicker}
    >
      <div className="flex flex-col h-full px-6 pb-6">
        {/* Routine name */}
        <div className="mb-6">
          <label className="text-gray-subtitle text-xs font-semibold uppercase tracking-widest mb-2 block">
            Routine Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent text-white text-2xl font-bold tracking-tight outline-none placeholder-gray-subtitle border-b border-separator pb-2 focus:border-white transition-colors"
            placeholder="Enter routine name"
          />
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
          <AnimatePresence initial={false}>
            {exercises.map((routineEx, idx) => {
              const ex = exerciseMap.get(routineEx.exerciseId);
              if (!ex) return null;
              return (
                <motion.div
                  key={routineEx.exerciseId + idx}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 py-3"
                >
                  {/* Illustration */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ex.image}
                    alt={ex.title}
                    className="w-10 h-10 rounded-full shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {ex.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {ex.type === "stretch" ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={routineEx.duration ?? ex.duration}
                            onChange={(e) =>
                              updateField(idx, "duration", Number(e.target.value))
                            }
                            className="w-14 bg-white/5 text-gray-timer text-xs rounded-lg px-2 py-1 outline-none"
                          />
                          <span className="text-gray-subtitle text-xs">s</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={routineEx.reps ?? 12}
                            onChange={(e) =>
                              updateField(idx, "reps", Number(e.target.value))
                            }
                            className="w-14 bg-white/5 text-gray-timer text-xs rounded-lg px-2 py-1 outline-none"
                          />
                          <span className="text-gray-subtitle text-xs">reps</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reorder */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => moveExercise(idx, -1)}
                      className="text-gray-subtitle hover:text-white"
                    >
                      <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => moveExercise(idx, 1)}
                      className="text-gray-subtitle hover:text-white"
                    >
                      <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeExercise(idx)}
                    className="text-gray-subtitle hover:text-accent-red"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {exercises.length === 0 && (
            <p className="text-gray-subtitle text-sm text-center py-12">
              No exercises added yet
            </p>
          )}
        </div>

        {/* Add exercise trigger */}
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-2 text-accent-blue font-semibold text-sm py-4 mt-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add Exercise
        </button>

        {/* Save CTA */}
        <div className="mt-auto pt-4">
          <Button onClick={saveRoutine} variant="primary">
            {isEditing ? "Update Routine" : "Save Routine"}
          </Button>
        </div>
      </div>

      {/* Exercise picker sheet */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 bg-neutral-900 rounded-t-3xl z-50 max-h-[70%] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-separator">
              <h2 className="text-white font-bold text-lg">Add Exercise</h2>
              <button onClick={() => setShowPicker(false)}>
                <X className="w-5 h-5 text-gray-subtitle" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto no-scrollbar shrink-0">
              {(["all", "stretch", "workout"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setPickerFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-colors",
                    pickerFilter === f
                      ? "bg-white text-black"
                      : "bg-white/5 text-gray-subtitle"
                  )}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto no-scrollbar p-4 space-y-1">
              {allExercises
                .filter((ex) => pickerFilter === "all" || ex.type === pickerFilter)
                .map((ex) => {
                const alreadyAdded = exercises.some(
                  (re) => re.exerciseId === ex.id
                );
                return (
                  <button
                    key={ex.id}
                    onClick={() => !alreadyAdded && addExercise(ex)}
                    disabled={alreadyAdded}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-left transition-opacity",
                      alreadyAdded ? "opacity-30" : "active:bg-white/5"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ex.image}
                      alt={ex.title}
                      className="w-10 h-10 rounded-full shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">
                        {ex.title}
                      </p>
                      <p className="text-gray-subtitle text-xs">
                        {ex.type === "stretch"
                          ? `${ex.duration}s hold`
                          : `reps based`}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-accent-blue" strokeWidth={2} />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full bg-black text-gray-subtitle text-sm">
          Loading...
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
