"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Users, Calendar } from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";

interface AttendanceContentProps {
  meetings: Array<{
    id: string;
    title: string;
    startTime: Date;
    _count: { attendance: number };
    attendance: Array<{
      id: string;
      status: string;
      joinedAt: Date;
      leftAt: Date | null;
      duration: number | null;
      user: { name: string; email: string; avatarUrl: string | null };
    }>;
  }>;
}

export function AttendanceContent({ meetings }: AttendanceContentProps) {
  const [selected, setSelected] = useState(meetings[0]?.id ?? "");
  const selectedMeeting = meetings.find((m) => m.id === selected);

  const exportCSV = () => {
    if (!selectedMeeting) return;
    const rows = [
      ["Nama", "Email", "Status", "Waktu Masuk", "Waktu Keluar", "Durasi"],
      ...selectedMeeting.attendance.map((a) => [
        a.user.name,
        a.user.email,
        a.status,
        new Date(a.joinedAt).toLocaleString("id-ID"),
        a.leftAt ? new Date(a.leftAt).toLocaleString("id-ID") : "-",
        a.duration ? formatDuration(a.duration) : "-",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `absensi-${selectedMeeting.title}.csv`;
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Daftar Kehadiran</h1>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--voon-bg-elevated)] border border-white/10 text-gray-300 rounded-xl text-sm hover:bg-white/10 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Belum ada data kehadiran</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Meeting list */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Meeting</p>
            {meetings.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                className={`w-full text-left p-3 rounded-xl transition-colors ${
                  selected === m.id
                    ? "bg-blue-600/20 border border-blue-500/30 text-blue-400"
                    : "bg-[var(--voon-bg-card)] border border-white/5 text-gray-300 hover:bg-white/5"
                }`}
              >
                <p className="text-sm font-medium truncate">{m.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(m.startTime).toLocaleDateString("id-ID")}
                  <Users className="w-3 h-3 ml-1" />
                  {m._count.attendance}
                </div>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="lg:col-span-3">
            {selectedMeeting && (
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5"
              >
                <h2 className="text-white font-semibold mb-1">{selectedMeeting.title}</h2>
                <p className="text-gray-500 text-sm mb-4">{formatDateTime(selectedMeeting.startTime)}</p>
                <AttendanceTable records={selectedMeeting.attendance} />
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
