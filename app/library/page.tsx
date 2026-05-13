"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ListItem } from "@/components/ListItem";
import { useStorage } from "@/components/StorageProvider";
import { ExerciseType } from "@/types";
import { useExercises } from "@/lib/useExercises";
import { Search, Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";

const typeFilters: { label: string; value: ExerciseType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Stretch", value: "stretch" },
  { label: "Workout", value: "workout" },
];

const difficultyFilters = ["all", "beginner", "intermediate", "advanced"];

export default function LibraryPage() {
  const storage = useStorage();
  const { exercises, loading } = useExercises();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ExerciseType | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    storage.getFavorites().then(setFavorites);
  }, [storage]);

  const toggleFavorite = async (id: string) => {
    const isNowFav = await storage.toggleFavorite(id);
    setFavorites((prev) =>
      isNowFav ? [...prev, id] : prev.filter((f) => f !== id)
    );
  };

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        search === "" ||
        ex.title.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscles.some((m) =>
          m.toLowerCase().includes(search.toLowerCase())
        );
      const matchesType = typeFilter === "all" || ex.type === typeFilter;
      const matchesDifficulty =
        difficultyFilter === "all" || ex.difficulty === difficultyFilter;
      return matchesSearch && matchesType && matchesDifficulty;
    });
  }, [exercises, search, typeFilter, difficultyFilter]);

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76,
    overscan: 8,
  });

  const virtualItems = virtualizer.getVirtualItems();

  if (loading) {
    return (
      <AppShell header={<Header title="Exercise Library" />}>
        <div className="flex items-center justify-center h-full text-gray-subtitle text-sm">
          Loading exercises...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      header={<Header title="Exercise Library" />}
      mainClassName="overflow-hidden"
    >
      <div className="flex flex-col h-full px-6 pb-6 space-y-5">
        {/* Search */}
        <div className="relative shrink-0">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-subtitle"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-white/5 text-white placeholder-gray-subtitle text-sm rounded-2xl py-3 pl-10 pr-10 outline-none focus:bg-white/10 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-subtitle" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Type filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-colors",
                typeFilter === f.value
                  ? "bg-white text-black"
                  : "bg-white/5 text-gray-subtitle"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Difficulty filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {difficultyFilters.map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wide whitespace-nowrap transition-colors",
                difficultyFilter === d
                  ? "bg-accent-blue/20 text-accent-blue"
                  : "bg-white/5 text-gray-subtitle"
              )}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Virtualized List */}
        <div className="flex-1 overflow-hidden -mx-6">
          <div
            ref={parentRef}
            className="h-full overflow-y-auto no-scrollbar px-6"
          >
            {filtered.length > 0 ? (
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualItems.map((virtualItem) => {
                  const ex = filtered[virtualItem.index];
                  const isFav = favorites.includes(ex.id);
                  return (
                    <div
                      key={ex.id}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <ListItem
                        title={ex.title}
                        subtitle={`${ex.type} · ${
                          ex.type === "stretch"
                            ? ex.duration + "s · "
                            : ""
                        }${ex.difficulty}`}
                        image={
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ex.image}
                            alt={ex.title}
                            className="w-full h-full"
                            loading="lazy"
                          />
                        }
                        right={
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-timer font-medium">
                              {ex.type === "stretch"
                                ? `${ex.duration}s`
                                : "reps"}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(ex.id);
                              }}
                            >
                              <Heart
                                className={cn(
                                  "w-5 h-5 transition-colors",
                                  isFav
                                    ? "text-accent-red fill-accent-red"
                                    : "text-gray-subtitle"
                                )}
                                strokeWidth={1.5}
                              />
                            </button>
                          </div>
                        }
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-subtitle text-sm text-center py-12">
                No exercises found
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
