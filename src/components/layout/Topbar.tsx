"use client";

import { signOut, useSession } from "next-auth/react";
import { Bell, Search, LogOut, User } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? session?.user?.email ?? "Akun";
  const initial = userName[0]?.toUpperCase() ?? "?";

  return (
    <header className="h-16 bg-[var(--voon-bg-card)]/80 backdrop-blur-md border-b border-white/5 flex items-center px-4 gap-4 sticky top-0 z-20">
      <MobileNav />

      {title && (
        <h1 className="text-white font-semibold hidden md:block">{title}</h1>
      )}

      <div className="flex-1 max-w-md hidden md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Cari meeting..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        {session ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {initial}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>
    </header>
  );
}
