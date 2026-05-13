import { useState, useEffect } from "react";
import { Exercise } from "@/types";

let cache: Exercise[] | null = null;
let promise: Promise<Exercise[]> | null = null;

async function loadExercises(): Promise<Exercise[]> {
  if (cache) return cache;
  if (promise) return promise;

  promise = fetch("/data/exercises.json")
    .then((res) => res.json())
    .then((data) => {
      cache = data as Exercise[];
      return cache;
    });

  return promise;
}

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) {
      setExercises(cache);
      setLoading(false);
      return;
    }
    loadExercises().then((data) => {
      setExercises(data);
      setLoading(false);
    });
  }, []);

  return { exercises, loading };
}
