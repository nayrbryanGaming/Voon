"use client";

import Link from "next/link";
import { Calendar, Users, Clock, Brain, Video } from "lucide-react";
import { formatDateTime, formatDuration, cn } from "@/lib/utils";

interface MeetingCardProps {
  meeting: {
    id: string;
    title: string;
    description: string | null;
    startTime: Date;
    duration: number | null;
    status: string;
    roomId: string;
    summary: { summary: string } | null;
    _count: { attendance: number; participants: number };
  };
}

const statusConfig = {
  SCHEDULED: { label: "Terjadwal", className: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  LIVE: { label: "Live", className: "text-red-400 bg-red-500/10 border-red-500/20" },
  ENDED: { label: "Selesai", className: "text-gray-400 bg-white/5 border-white/10" },
  CANCELLED: { label: "Dibatalkan", className: "text-gray-500 bg-white/5 border-white/5" },
} as const;

export function MeetingCard({ meeting }: MeetingCardProps) {
  const config = statusConfig[meeting.status as keyof typeof statusConfig] ?? statusConfig.SCHEDULED;

  return (
    <div className="p-5 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate group-hover:text-blue-400 transition-colors">
            {meeting.title}
          </h3>
          {meeting.description && (
            <p className="text-gray-500 text-xs mt-0.5 truncate">{meeting.description}</p>
          )}
        </div>
        <span className={cn("text-xs px-2 py-1 rounded-lg border flex-shrink-0 ml-2 flex items-center gap-1", config.className)}>
          {meeting.status === "LIVE" && <span className="live-dot w-1.5 h-1.5 rounded-full bg-red-400" />}
          {config.label}
        </span>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDateTime(meeting.startTime)}</span>
        </div>
        {meeting.duration && (
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDuration(meeting.duration)}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Users className="w-3.5 h-3.5" />
          <span>{meeting._count.attendance} peserta hadir</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {meeting.status === "LIVE" ? (
          <Link
            href={`/room/${meeting.roomId}`}
            className="flex-1 text-center py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-xl font-semibold transition-colors"
          >
            Bergabung
          </Link>
        ) : meeting.status === "SCHEDULED" ? (
          <Link
            href={`/meetings/${meeting.id}`}
            className="flex-1 text-center py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm rounded-xl font-semibold transition-colors border border-blue-500/20"
          >
            Lihat Detail
          </Link>
        ) : (
          <Link
            href={`/meetings/${meeting.id}/recap`}
            className="flex-1 text-center py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-xl font-semibold transition-colors"
          >
            Lihat Rekap
          </Link>
        )}
        {meeting.summary && (
          <span className="text-purple-400 bg-purple-500/10 border border-purple-500/20 p-2 rounded-xl">
            <Brain className="w-4 h-4" />
          </span>
        )}
        {meeting.status !== "SCHEDULED" && !meeting.summary && (
          <Link href={`/recordings`} className="text-gray-500 bg-white/5 p-2 rounded-xl hover:bg-white/10 transition-colors">
            <Video className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
