"use client";

import { useMeetingStore } from "@/store/useMeetingStore";
import { Hand } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function RaiseHandIndicator() {
  const raisedHands = useMeetingStore((s) => s.raisedHands);
  const hands = Array.from(raisedHands);

  return (
    <AnimatePresence>
      {hands.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-20 left-4 flex flex-col gap-1 z-10"
        >
          {hands.map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 rounded-full bg-yellow-500/90 px-3 py-1.5 text-sm text-white shadow"
            >
              <Hand className="h-3.5 w-3.5" />
              <span>{name}</span>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
