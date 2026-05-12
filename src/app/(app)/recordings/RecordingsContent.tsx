"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Video, Clock, Brain, ChevronDown, ChevronUp } from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { MeetingReplay } from "@/components/meeting/MeetingReplay";

interface RecordingsContentProps {
  meetings: Array<{
    id: string;
    title: string;
    startTime: Date;
    duration: number | null;
    recordingUrl: string | null;
    summary: { topics: string[] } | null;
  }>;
}

export function RecordingsContent({ meetings }: RecordingsContentProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (meetings.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-8">Rekaman</h1>
        <div className="text-center py-20 text-gray-500">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Belum ada rekaman</p>
          <p className="text-xs mt-1">Aktifkan rekaman saat membuat atau saat meeting berlangsung</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Rekaman ({meetings.length})</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {meetings.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-[var(--voon-bg-card)] border border-white/5 overflow-hidden"
          >
            {expanded === m.id && m.recordingUrl ? (
              <MeetingReplay
                recordingUrl={m.recordingUrl}
                title={m.title}
                chapters={
                  m.summary?.topics.map((t, idx) => ({ title: t, timestamp: idx * 300 })) ?? []
                }
              />
            ) : (
              <button
                className="relative w-full aspect-video bg-[var(--voon-bg-elevated)] flex items-center justify-center group"
                onClick={() => setExpanded(m.id)}
              >
                <div className="w-12 h-12 rounded-full bg-blue-600/80 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-2 right-2 text-xs text-gray-500 bg-black/60 px-2 py-0.5 rounded">
                  Putar Rekaman
                </span>
              </button>
            )}

            <div className="p-4">
              <h3 className="text-white font-semibold text-sm truncate mb-1">{m.title}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span>{formatDateTime(m.startTime)}</span>
                {m.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(m.duration)}
                  </span>
                )}
              </div>

              {m.summary?.topics && m.summary.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {m.summary.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full flex items-center gap-1"
                    >
                      <Brain className="w-2.5 h-2.5" />
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-xs font-semibold border border-blue-500/20 transition-colors"
              >
                {expanded === m.id ? (
                  <><ChevronUp className="w-3.5 h-3.5" /> Sembunyikan</>
                ) : (
                  <><ChevronDown className="w-3.5 h-3.5" /> Putar & Lihat Bab AI</>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
