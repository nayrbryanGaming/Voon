import { cn } from "@/lib/utils";

const statusConfig = {
  PRESENT: { label: "Hadir", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  LATE: { label: "Terlambat", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  ABSENT: { label: "Tidak Hadir", className: "text-red-400 bg-red-500/10 border-red-500/20" },
  EXCUSED: { label: "Izin", className: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
} as const;

export function AttendanceBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.ABSENT;
  return (
    <span className={cn("text-xs px-2 py-1 rounded-lg border", config.className)}>
      {config.label}
    </span>
  );
}
