"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BACKGROUNDS = [
  { id: "none", label: "Tidak Ada", color: "bg-gray-200" },
  { id: "blur", label: "Blur", color: "bg-blue-200" },
  { id: "office", label: "Kantor", color: "bg-amber-200" },
  { id: "campus", label: "Kampus", color: "bg-green-200" },
  { id: "library", label: "Perpustakaan", color: "bg-purple-200" },
];

interface BackgroundSelectorProps {
  onSelect?: (bgId: string) => void;
}

export function BackgroundSelector({ onSelect }: BackgroundSelectorProps) {
  const [selected, setSelected] = useState("none");

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect?.(id);
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <span className="font-semibold text-sm">Latar Belakang Virtual</span>
      <div className="grid grid-cols-3 gap-2">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.id}
            onClick={() => handleSelect(bg.id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg p-2 border-2 transition-all",
              selected === bg.id ? "border-primary" : "border-transparent hover:border-muted"
            )}
          >
            <div className={cn("w-full h-10 rounded", bg.color)} />
            <span className="text-xs">{bg.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Fitur blur/virtual background memerlukan browser yang mendukung.
      </p>
    </div>
  );
}
