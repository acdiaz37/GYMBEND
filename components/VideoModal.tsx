"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSlug: string;
  exerciseTitle: string;
}

type Gender = "male" | "female";

function getVideoUrls(slug: string, gender: Gender) {
  const base =
    "https://media.musclewiki.com/media/uploads/videos/branded";
  const prefix = `${gender}-Kettlebells-${slug}`;
  return {
    front: `${base}/${prefix}-front.mp4`,
    side: `${base}/${prefix}-side.mp4`,
  };
}

export function VideoModal({
  isOpen,
  onClose,
  videoSlug,
  exerciseTitle,
}: VideoModalProps) {
  const [gender, setGender] = useState<Gender>("male");
  const urls = getVideoUrls(videoSlug, gender);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">
                {exerciseTitle}
              </h3>
              <p className="text-gray-subtitle text-xs">Demonstration</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" strokeWidth={1.5} />
            </button>
          </div>

          {/* Gender toggle */}
          <div className="px-6 pb-3 shrink-0">
            <div className="flex bg-white/10 rounded-full p-1">
              {(["male", "female"] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
                    gender === g
                      ? "bg-white text-black"
                      : "text-gray-subtitle"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Videos */}
          <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-6">
            <div>
              <p className="text-gray-subtitle text-xs uppercase tracking-widest font-semibold mb-2">
                Front View
              </p>
              <div className="rounded-2xl overflow-hidden bg-neutral-900">
                <video
                  key={urls.front}
                  src={urls.front}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full aspect-[4/3] object-contain"
                />
              </div>
            </div>

            <div>
              <p className="text-gray-subtitle text-xs uppercase tracking-widest font-semibold mb-2">
                Side View
              </p>
              <div className="rounded-2xl overflow-hidden bg-neutral-900">
                <video
                  key={urls.side}
                  src={urls.side}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full aspect-[4/3] object-contain"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
