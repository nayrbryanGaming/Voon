"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("voon-theme");
    const isDark = stored !== "light";
    setDark(isDark);
    document.documentElement.classList.toggle("light-mode", !isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("voon-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("light-mode", !next);
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
      title={dark ? "Mode Terang" : "Mode Gelap"}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
