"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Download, Video, Clock, Brain } from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/utils";

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
  const [playing, setPlaying] = useState<string | null>(null);

  if (meetings.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-8">Rekaman</h1>
        <div className="text-center py-20 text-gray-500">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Belum ada rekaman</p>
          <p className="text-xs mt-1">Aktifkan rekaman saat membuat meeting</p>
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
            className="p-4 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5"
          >
            {playing === m.id && m.recordingUrl ? (
              <video
                src={m.recordingUrl}
                controls
                autoPlay
                className="w-full rounded-xl bg-black mb-3 aspect-video"
              />
            ) : (
              <div
                className="relative aspect-video bg-[var(--voon-bg-elevated)] rounded-xl mb-3 flex items-center justify-center cursor-pointer group"
                onClick={() => setPlaying(m.id)}
              >
                <div className="w-12 h-12 rounded-full bg-blue-600/80 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <Play className="w-5 h-5 text-white ml-0.5" />
                </div>
              </div>
            )}

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
                  <span key={topic} className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setPlaying(playing === m.id ? null : m.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-xs font-semibold border border-blue-500/20 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                {playing === m.id ? "Tutup" : "Putar"}
              </button>
              {m.recordingUrl && (
                <a
                  href={m.recordingUrl}
                  download
                  className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl border border-white/10 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
