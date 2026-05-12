"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface WaitingRoomProps {
  message?: string;
}

export function WaitingRoom({ message = "Menunggu host untuk memulai rapat..." }: WaitingRoomProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      >
        <Loader2 className="h-12 w-12 text-primary" />
      </motion.div>
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Ruang Tunggu</h2>
        <p className="text-muted-foreground text-sm max-w-xs">{message}</p>
      </div>
    </div>
  );
}
