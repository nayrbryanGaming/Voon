export const APP_NAME = "Voon";
export const APP_TAGLINE = "Meet at the Speed of Voice";
export const APP_DESCRIPTION = "Platform video conference gratis, unlimited, khusus kampus Indonesia.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://voon.vercel.app";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/meetings", label: "Pertemuan", icon: "Calendar" },
  { href: "/recordings", label: "Rekaman", icon: "Video" },
  { href: "/attendance", label: "Kehadiran", icon: "ClipboardList" },
  { href: "/whiteboard", label: "Papan Tulis", icon: "PenTool" },
  { href: "/settings", label: "Pengaturan", icon: "Settings" },
] as const;

export const MEETING_STATUS_LABELS = {
  SCHEDULED: "Terjadwal",
  LIVE: "Berlangsung",
  ENDED: "Selesai",
  CANCELLED: "Dibatalkan",
} as const;

export const ATTENDANCE_STATUS_LABELS = {
  PRESENT: "Hadir",
  LATE: "Terlambat",
  ABSENT: "Tidak Hadir",
  EXCUSED: "Izin",
} as const;

export const USER_ROLE_LABELS = {
  STUDENT: "Mahasiswa",
  LECTURER: "Dosen",
  ADMIN: "Admin",
} as const;

export const LIVEKIT_DATA_TOPICS = {
  CHAT: "chat",
  RAISE_HAND: "raise-hand",
  REACTION: "reaction",
  POLL: "poll",
  CAPTION: "caption",
} as const;
