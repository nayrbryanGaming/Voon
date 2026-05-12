"use client";

import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  status: string;
  joinedAt: Date;
  leftAt?: Date | null;
  duration?: number | null;
  user: { name: string; email: string; avatarUrl?: string | null };
}

const statusConfig = {
  PRESENT: { label: "Hadir", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  LATE: { label: "Terlambat", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  ABSENT: { label: "Tidak Hadir", className: "text-red-400 bg-red-500/10 border-red-500/20" },
  EXCUSED: { label: "Izin", className: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
} as const;

export function AttendanceTable({ records }: { records: AttendanceRecord[] }) {
  if (records.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-8">Tidak ada data kehadiran</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-2 text-gray-400 font-medium">Nama</th>
            <th className="text-left py-3 px-2 text-gray-400 font-medium">Status</th>
            <th className="text-left py-3 px-2 text-gray-400 font-medium">Masuk</th>
            <th className="text-left py-3 px-2 text-gray-400 font-medium">Keluar</th>
            <th className="text-left py-3 px-2 text-gray-400 font-medium">Durasi</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const config = statusConfig[r.status as keyof typeof statusConfig] ?? statusConfig.PRESENT;
            return (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="py-3 px-2">
                  <p className="text-white font-medium">{r.user.name}</p>
                  <p className="text-gray-500 text-xs">{r.user.email}</p>
                </td>
                <td className="py-3 px-2">
                  <span className={cn("text-xs px-2 py-1 rounded-lg border", config.className)}>
                    {config.label}
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-400 font-mono text-xs">
                  {new Date(r.joinedAt).toLocaleTimeString("id-ID")}
                </td>
                <td className="py-3 px-2 text-gray-400 font-mono text-xs">
                  {r.leftAt ? new Date(r.leftAt).toLocaleTimeString("id-ID") : "—"}
                </td>
                <td className="py-3 px-2 text-gray-400 text-xs">
                  {r.duration ? formatDuration(r.duration) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
