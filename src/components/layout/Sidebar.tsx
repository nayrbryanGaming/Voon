"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Video,
  ClipboardList,
  PenTool,
  Settings,
  Plus,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meetings", label: "Pertemuan", icon: Calendar },
  { href: "/recordings", label: "Rekaman", icon: Video },
  { href: "/attendance", label: "Kehadiran", icon: ClipboardList },
  { href: "/whiteboard", label: "Papan Tulis", icon: PenTool },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

interface CampusInfo {
  id: string;
  name: string;
  domain: string | null;
  logoUrl: string | null;
}

export function Sidebar() {
  const pathname = usePathname();
  const [campus, setCampus] = useState<CampusInfo | null>(null);

  useEffect(() => {
    fetch("/api/user/campus")
      .then((r) => r.json())
      .then((data) => { if (data) setCampus(data); })
      .catch(() => {});
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-[var(--voon-bg-card)] border-r border-white/5 fixed left-0 top-0 bottom-0 z-30">
      {/* Logo / Campus branding */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">V</div>
        <div className="min-w-0">
          <span className="text-white font-bold text-xl block leading-none">Voon</span>
          {campus && (
            <span className="text-xs text-emerald-400 truncate block mt-0.5 leading-none" title={campus.name}>
              {campus.name}
            </span>
          )}
        </div>
      </div>

      {/* Quick action */}
      <div className="px-4 pt-4">
        <Link
          href="/meetings/new"
          className="flex items-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Meeting Baru
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                active
                  ? "bg-blue-600/20 text-blue-400 font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Campus badge */}
      {campus && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-emerald-400 truncate">{campus.name}</span>
          </div>
        </div>
      )}

      {/* User */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm text-gray-400">Akun</span>
        </div>
      </div>
    </aside>
  );
}
