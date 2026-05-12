"use client";

import { motion } from "framer-motion";
import { Brain, CheckSquare, Users, FileText, Video, Clock, Download } from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { AISummaryCard } from "@/components/ai/AISummaryCard";
import { AIActionItems } from "@/components/ai/AIActionItems";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";

interface RecapContentProps {
  meeting: {
    id: string;
    title: string;
    startTime: Date;
    duration: number | null;
    status: string;
    recordingUrl: string | null;
    summary: {
      summary: string;
      keyPoints: string[];
      actionItems: string[];
      topics: string[];
      sentiment: string | null;
    } | null;
    transcript: { content: string } | null;
    attendance: Array<{
      id: string;
      status: string;
      joinedAt: Date;
      leftAt: Date | null;
      duration: number | null;
      user: { name: string; avatarUrl: string | null; email: string };
    }>;
    _count: { attendance: number };
  };
}

export function RecapContent({ meeting }: RecapContentProps) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{meeting.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {formatDateTime(meeting.startTime)}
          </span>
          {meeting.duration && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Durasi: {formatDuration(meeting.duration)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {meeting._count.attendance} peserta
          </span>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* AI Summary */}
        {meeting.summary ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <AISummaryCard summary={meeting.summary} />
          </motion.div>
        ) : (
          <div className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5 text-center">
            <Brain className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Notulen AI sedang diproses atau belum tersedia</p>
          </div>
        )}

        {/* Action items */}
        {meeting.summary?.actionItems && meeting.summary.actionItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <AIActionItems items={meeting.summary.actionItems} />
          </motion.div>
        )}

        {/* Attendance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="text-white font-semibold">Daftar Kehadiran</h2>
              <span className="text-xs text-gray-500 ml-auto">{meeting._count.attendance} peserta</span>
            </div>
            <AttendanceTable records={meeting.attendance} />
          </div>
        </motion.div>

        {/* Transcript */}
        {meeting.transcript && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <h2 className="text-white font-semibold">Transkrip Lengkap</h2>
                </div>
                <button className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300">
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                {meeting.transcript.content}
              </div>
            </div>
          </motion.div>
        )}

        {/* Recording */}
        {meeting.recordingUrl && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-5 h-5 text-blue-400" />
                <h2 className="text-white font-semibold">Rekaman</h2>
              </div>
              <video
                controls
                src={meeting.recordingUrl}
                className="w-full rounded-xl bg-black"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
