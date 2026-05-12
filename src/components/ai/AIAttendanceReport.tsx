"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, Clock, AlertCircle } from "lucide-react";

interface AttendanceRecord {
  userId: string;
  userName: string;
  status: "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";
  joinedAt?: string;
  duration?: number;
}

interface AIAttendanceReportProps {
  meetingId: string;
  meetingTitle?: string;
}

const STATUS_CONFIG = {
  PRESENT: { label: "Hadir", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  LATE: { label: "Terlambat", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  ABSENT: { label: "Tidak Hadir", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  EXCUSED: { label: "Izin", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
} as const;

export function AIAttendanceReport({ meetingId, meetingTitle }: AIAttendanceReportProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>("");

  useEffect(() => {
    fetch(`/api/attendance?meetingId=${meetingId}`)
      .then((r) => r.json())
      .then((data) => {
        setRecords(data.records ?? []);
        setSummary(data.aiSummary ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [meetingId]);

  const stats = {
    present: records.filter((r) => r.status === "PRESENT").length,
    late: records.filter((r) => r.status === "LATE").length,
    absent: records.filter((r) => r.status === "ABSENT").length,
    excused: records.filter((r) => r.status === "EXCUSED").length,
    total: records.length,
  };

  const attendanceRate = stats.total > 0
    ? Math.round(((stats.present + stats.late) / stats.total) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {meetingTitle && (
        <h3 className="text-white font-semibold text-lg">{meetingTitle}</h3>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">Tingkat Kehadiran</span>
          </div>
          <p className="text-2xl font-bold text-white">{attendanceRate}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Total Peserta</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {(["present", "late", "absent", "excused"] as const).map((key) => {
          const statusKey = key.toUpperCase() as keyof typeof STATUS_CONFIG;
          const cfg = STATUS_CONFIG[statusKey];
          return (
            <div key={key} className={`p-2 rounded-xl border text-center ${cfg.color}`}>
              <p className="text-lg font-bold">{stats[key]}</p>
              <p className="text-xs">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* AI Summary */}
      {summary && (
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">Analisis AI</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Records Table */}
      {records.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-500 font-medium pb-2">Nama</th>
                <th className="text-left text-gray-500 font-medium pb-2">Status</th>
                <th className="text-left text-gray-500 font-medium pb-2">Durasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.map((rec) => (
                <tr key={rec.userId}>
                  <td className="py-2.5 text-white">{rec.userName}</td>
                  <td className="py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_CONFIG[rec.status].color}`}>
                      {STATUS_CONFIG[rec.status].label}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-400">
                    {rec.duration != null ? `${Math.round(rec.duration / 60)} menit` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 text-sm py-4">Belum ada data kehadiran</p>
      )}
    </div>
  );
}
