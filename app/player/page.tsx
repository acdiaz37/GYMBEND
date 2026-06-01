"use client";

import { useEffect, useState, useCallback, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStorage } from "@/components/StorageProvider";
import { Routine, ProgressLog } from "@/types";
import { useExercises } from "@/lib/useExercises";
import { playStartBeep, playCountdownBeep, playRestAmbient } from "@/lib/audio";
import { Play, Pause, SkipForward, SkipBack, X, Check, Film } from "lucide-react";
import { VideoModal } from "@/components/VideoModal";
import { generateId } from "@/lib/utils";

const REST_DURATION = 15;

function ProgressRing({
  radius,
  stroke,
  progress,
}: {
  radius: number;
  stroke: number;
  progress: number; // 0 to 1
}) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      className="rotate-[-90deg]"
    >
      <circle
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={stroke}
        fill="transparent"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="white"
        strokeWidth={stroke}
        strokeDasharray={circumference + " " + circumference}
        style={{ strokeDashoffset, transition: "stroke-dashoffset 1s linear" }}
        strokeLinecap="round"
        fill="transparent"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
}

function PlayerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storage = useStorage();
  const routineId = searchParams.get("routineId");
  const { exercises: allExercises, loading: exercisesLoading } = useExercises();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"exercise" | "rest">("exercise");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const hasStartedRef = useRef(false);

  // Load routine
  useEffect(() => {
    if (!routineId || allExercises.length === 0) return;
    storage.getRoutines().then((routines) => {
      const r = routines.find((rt) => rt.id === routineId);
      if (r) {
        const firstEx = allExercises.find(
          (e) => e.id === r.exercises[0]?.exerciseId
        );
        const isStretch = firstEx?.type === "stretch";
        const duration = isStretch ? (r.exercises[0]?.duration ?? firstEx?.duration ?? 0) : 0;
        setRoutine(r);
        setCurrentIndex(0);
        setPhase("exercise");
        setTimeLeft(duration);
        setIsPlaying(isStretch);
        hasStartedRef.current = false;
        startTimeRef.current = Date.now();
      }
    });
  }, [routineId, storage, allExercises]);

  const loadExerciseIndex = useCallback((index: number) => {
    if (!routine) return;
    const ex = allExercises.find((e) => e.id === routine.exercises[index]?.exerciseId);
    const isStretch = ex?.type === "stretch";
    const duration = isStretch ? (routine.exercises[index]?.duration ?? ex?.duration ?? 0) : 0;
    setCurrentIndex(index);
    setPhase("exercise");
    setTimeLeft(duration);
    setIsPlaying(isStretch);
    hasStartedRef.current = false;
  }, [routine, allExercises]);

  const currentRoutineEx = routine?.exercises[currentIndex];
  const currentExercise = useMemo(() => {
    if (!currentRoutineEx) return null;
    return allExercises.find((e) => e.id === currentRoutineEx.exerciseId);
  }, [currentRoutineEx, allExercises]);

  const nextExercise = useMemo(() => {
    if (!routine || currentIndex >= routine.exercises.length - 1) return null;
    const nextId = routine.exercises[currentIndex + 1]?.exerciseId;
    return allExercises.find((e) => e.id === nextId);
  }, [routine, currentIndex, allExercises]);

  const totalExercises = routine?.exercises.length ?? 0;

  // Timer decrements every second while playing
  useEffect(() => {
    if (!isPlaying || isFinished) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isFinished]);

  // Start beep when stretch timer begins
  useEffect(() => {
    if (
      isPlaying &&
      phase === "exercise" &&
      currentExercise?.type === "stretch" &&
      !hasStartedRef.current
    ) {
      hasStartedRef.current = true;
      playStartBeep();
    }
  }, [isPlaying, phase, currentExercise]);

  // Countdown beep in last 5 seconds
  useEffect(() => {
    if (!isPlaying || isFinished) return;
    if (timeLeft > 0 && timeLeft <= 5) {
      playCountdownBeep();
    }
  }, [timeLeft, isPlaying, isFinished]);

  // Rest ambient sound when entering rest phase
  useEffect(() => {
    if (phase === "rest") {
      playRestAmbient();
    }
  }, [phase]);

  // React to timeLeft reaching 0
  useEffect(() => {
    if (timeLeft > 0 || isFinished || !routine) return;
    if (phase === "exercise" && !isPlaying) return;

    if (phase === "exercise") {
      if (currentExercise?.type === "stretch") {
        // Auto-start rest after stretch
        setPhase("rest");
        setTimeLeft(REST_DURATION);
        setIsPlaying(true);
      }
      // Workouts pause and wait for user to press Done/Next
    } else if (phase === "rest") {
      // Rest finished — PAUSE and wait for Continue
      setIsPlaying(false);
    }
  }, [timeLeft, phase, isFinished, routine, currentExercise, isPlaying]);

  const finishWorkout = useCallback(() => {
    if (!routine) return;
    const total =
      Math.floor((Date.now() - startTimeRef.current + pausedTimeRef.current) / 1000) ||
      routine.exercises.reduce((acc, re) => {
        const ex = allExercises.find((e) => e.id === re.exerciseId);
        return acc + (re.duration ?? (ex?.type === "stretch" ? ex?.duration : 0) ?? 0);
      }, 0);
    setTotalDuration(total);
    setIsFinished(true);
    setIsPlaying(false);
    const log: ProgressLog = {
      id: generateId(),
      routineId: routine.id,
      completedAt: new Date().toISOString(),
      duration: total,
    };
    storage.logProgress(log);
  }, [routine, storage, allExercises]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pausedTimeRef.current += Date.now() - startTimeRef.current;
    } else {
      startTimeRef.current = Date.now();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = useCallback(() => {
    if (!routine) return;

    if (phase === "exercise") {
      if (currentIndex < routine.exercises.length - 1) {
        setPhase("rest");
        setTimeLeft(REST_DURATION);
        setIsPlaying(true);
      } else {
        finishWorkout();
      }
    } else if (phase === "rest") {
      if (currentIndex < routine.exercises.length - 1) {
        loadExerciseIndex(currentIndex + 1);
      } else {
        finishWorkout();
      }
    }
  }, [phase, currentIndex, routine, finishWorkout, loadExerciseIndex]);

  const handlePrev = () => {
    if (!routine || currentIndex === 0) return;
    if (phase === "rest") {
      // Go back to current exercise
      loadExerciseIndex(currentIndex);
    } else {
      // Go to previous exercise
      loadExerciseIndex(currentIndex - 1);
    }
  };

  const handleDone = () => {
    handleNext();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = useMemo(() => {
    if (phase === "rest") {
      return (REST_DURATION - timeLeft) / REST_DURATION;
    }
    if (!currentExercise || !currentRoutineEx) return 0;
    if (currentExercise.type === "workout") return 1;
    const total = currentRoutineEx.duration ?? currentExercise.duration ?? 1;
    if (total === 0) return 0;
    return (total - timeLeft) / total;
  }, [timeLeft, currentExercise, currentRoutineEx, phase]);

  if (exercisesLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-gray-subtitle text-sm">
        Loading...
      </div>
    );
  }

  if (!routineId) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-gray-subtitle text-sm">
        No routine selected
      </div>
    );
  }

  if (!routine || !currentExercise) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-gray-subtitle text-sm">
        Loading...
      </div>
    );
  }

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col h-full bg-black px-6 items-center justify-center text-center"
      >
        <div className="w-20 h-20 rounded-full bg-accent-blue/20 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-accent-blue" strokeWidth={2} />
        </div>
        <h2 className="text-white text-3xl font-bold tracking-tight mb-2">
          Well Done
        </h2>
        <p className="text-gray-subtitle text-sm mb-8">
          You completed {routine.exercises.length} exercises
        </p>
        <div className="flex items-center gap-2 text-gray-timer text-lg font-medium mb-12">
          <span className="text-4xl font-bold text-white">
            {formatTime(totalDuration)}
          </span>
          <span className="text-sm text-gray-subtitle">total</span>
        </div>
        <button
          onClick={() => router.push("/")}
          className="w-full py-4 rounded-3xl bg-white text-black font-bold uppercase tracking-wide text-sm"
        >
          Back to Home
        </button>
      </motion.div>
    );
  }

  const isRest = phase === "rest";
  const displayTitle = isRest ? "Rest" : currentExercise.title;
  const displaySubtitle = isRest
    ? nextExercise
      ? `Up next: ${nextExercise.title}`
      : "Almost done"
    : currentExercise.type;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full bg-black"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <button onClick={() => router.push("/")}>
          <X className="w-6 h-6 text-white" strokeWidth={1.5} />
        </button>
        <span className="text-gray-subtitle text-xs font-medium uppercase tracking-wide">
          {isRest ? `${currentIndex + 1} of ${totalExercises}` : `${currentIndex + 1} of ${totalExercises}`}
        </span>
        {currentExercise?.videoSlug ? (
          <button onClick={() => setShowVideo(true)} className="text-accent-blue">
            <Film className="w-5 h-5" strokeWidth={1.5} />
          </button>
        ) : (
          <div className="w-6" />
        )}
      </div>

      {/* Info */}
      <div className="text-center px-6 shrink-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={isRest ? "rest" : currentExercise.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-white text-2xl font-bold tracking-tight mb-1">
              {displayTitle}
            </h2>
            <p className="text-gray-subtitle text-sm capitalize">
              {displaySubtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Ring & Image */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative w-[280px] h-[280px]">
          <ProgressRing radius={140} stroke={6} progress={progress} />
          <div className="absolute inset-[3px] flex items-center justify-center">
            {isRest ? (
              <div className="w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full flex items-center justify-center overflow-hidden relative">
                {/* Breathing animated circles */}
                <motion.div
                  animate={{ scale: [0.85, 1.15, 0.85] }}
                  transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                  className="absolute w-full h-full rounded-full bg-white/10"
                />
                <motion.div
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, delay: 0.3 }}
                  className="absolute w-[80%] h-[80%] rounded-full bg-white/15"
                />
                <motion.div
                  animate={{ scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, delay: 0.6 }}
                  className="absolute w-[60%] h-[60%] rounded-full bg-white/20"
                />
                <span className="relative z-10 text-white/80 text-xs font-medium uppercase tracking-widest">
                  Breathe
                </span>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={currentExercise.image}
                alt={currentExercise.title}
                className="w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Timer / Reps — outside the ring */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {isRest ? (
              <motion.span
                key="rest-timer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-white text-6xl font-bold tracking-tighter block text-center"
              >
                {formatTime(timeLeft)}
              </motion.span>
            ) : currentExercise.type === "stretch" ? (
              <motion.span
                key="timer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-white text-6xl font-bold tracking-tighter block text-center"
              >
                {formatTime(timeLeft)}
              </motion.span>
            ) : (
              <motion.div
                key="reps"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <span className="text-white text-6xl font-bold tracking-tighter block">
                  {currentRoutineEx?.reps ?? 12}
                </span>
                <span className="text-gray-subtitle text-sm uppercase tracking-wide">
                  reps
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instructions (only during exercise) */}
        {!isRest && (
          <div className="mt-6 space-y-1 text-center">
            {currentExercise.instructions.map((inst, i) => (
              <p key={i} className="text-gray-subtitle text-sm">
                {inst}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 pb-8 pt-4 shrink-0">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0 && !isRest}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30"
          >
            <SkipBack className="w-6 h-6 text-white" strokeWidth={1.5} />
          </button>

          {isRest ? (
            <button
              onClick={handleNext}
              className="w-20 h-20 rounded-full bg-accent-blue flex items-center justify-center"
            >
              <span className="text-white text-xs font-bold uppercase">Continue</span>
            </button>
          ) : currentExercise.type === "stretch" ? (
            <button
              onClick={handlePlayPause}
              className="w-20 h-20 rounded-full bg-accent-blue flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" strokeWidth={1.5} fill="white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" strokeWidth={1.5} fill="white" />
              )}
            </button>
          ) : (
            <button
              onClick={handleDone}
              className="w-20 h-20 rounded-full bg-accent-blue flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
            </button>
          )}

          <button
            onClick={handleNext}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center"
          >
            <SkipForward className="w-6 h-6 text-white" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      {currentExercise?.videoSlug && (
        <VideoModal
          isOpen={showVideo}
          onClose={() => setShowVideo(false)}
          videoSlug={currentExercise.videoSlug}
          exerciseTitle={currentExercise.title}
        />
      )}
    </motion.div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full bg-black text-gray-subtitle text-sm">
          Loading...
        </div>
      }
    >
      <PlayerContent />
    </Suspense>
  );
}
