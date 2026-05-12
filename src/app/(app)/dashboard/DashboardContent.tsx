"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Link2, Calendar, Video, Clock, Users, Brain, TrendingUp } from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { getMeetingCountdown } from "@/lib/meeting-utils";

interface Props {
  user: { name: string; role: string } | null;
  upcomingMeetings: Array<{ id: string; title: string; startTime: Date; status: string }>;
  recentMeetings: Array<{
    id: string;
    title: string;
    startTime: Date;
    duration: number | null;
    status: string;
    summary: { summary: string } | null;
    _count: { attendance: number };
  }>;
  stats: { totalMeetings: number; totalAttendance: number };
}

export function DashboardContent({ user, upcomingMeetings, recentMeetings, stats }: Props) {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Selamat datang, {user?.name?.split(" ")[0] ?? "Pengguna"} 👋
        </h1>
        <p className="text-gray-400 mt-1">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        <Link
          href="/meetings/new?instant=true"
          className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-semibold transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold">Mulai Sekarang</div>
            <div className="text-xs text-blue-200">Meeting instan</div>
          </div>
        </Link>
        <Link
          href="/join"
          className="flex items-center gap-3 p-4 bg-[var(--voon-bg-elevated)] hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold">Masuk dengan Kode</div>
            <div className="text-xs text-gray-400">Join by invite code</div>
          </div>
        </Link>
        <Link
          href="/meetings/new"
          className="flex items-center gap-3 p-4 bg-[var(--voon-bg-elevated)] hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-bold">Jadwalkan</div>
            <div className="text-xs text-gray-400">Buat meeting terjadwal</div>
          </div>
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: "Total Meeting", value: stats.totalMeetings, icon: Video, color: "blue" },
          { label: "Meeting Dihadiri", value: stats.totalAttendance, icon: Users, color: "emerald" },
          { label: "Akan Datang", value: upcomingMeetings.length, icon: Clock, color: "amber" },
          { label: "Notulen AI", value: recentMeetings.filter((m) => m.summary).length, icon: Brain, color: "purple" },
        ].map((stat) => {
          const Icon = stat.icon;
          const colorMap: Record<string, string> = {
            blue: "bg-blue-500/10 text-blue-400",
            emerald: "bg-emerald-500/10 text-emerald-400",
            amber: "bg-amber-500/10 text-amber-400",
            purple: "bg-purple-500/10 text-purple-400",
          };
          return (
            <div key={stat.label} className="p-4 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5">
              <div className={`inline-flex p-2 rounded-lg mb-3 ${colorMap[stat.color]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Meeting Mendatang</h2>
            <Link href="/meetings" className="text-blue-400 text-sm hover:text-blue-300">
              Lihat semua
            </Link>
          </div>
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Tidak ada meeting mendatang</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/meetings/${meeting.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div>
                    <p className="text-sm text-white font-medium group-hover:text-blue-400 transition-colors">
                      {meeting.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(meeting.startTime)}</p>
                  </div>
                  <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg flex-shrink-0">
                    {getMeetingCountdown(new Date(meeting.startTime))}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Meeting Terbaru</h2>
            <Link href="/meetings" className="text-blue-400 text-sm hover:text-blue-300">
              Lihat semua
            </Link>
          </div>
          {recentMeetings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada meeting</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMeetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/meetings/${meeting.id}/recap`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div>
                    <p className="text-sm text-white font-medium group-hover:text-blue-400 transition-colors">
                      {meeting.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">
                        {meeting._count.attendance} peserta
                      </span>
                      {meeting.duration && (
                        <span className="text-xs text-gray-600">
                          · {formatDuration(meeting.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                  {meeting.summary && (
                    <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-lg flex-shrink-0 flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      AI
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
