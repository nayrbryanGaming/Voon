"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Video, Clock, Brain, ChevronDown, ChevronUp,
  Download, ExternalLink, AlertCircle, Loader2,
} from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { MeetingReplay } from "@/components/meeting/MeetingReplay";
import { toast } from "sonner";

const MAX_RECORDINGS = 5;

interface RecordingsContentProps {
  meetings: Array<{
    id: string;
    title: string;
    startTime: Date;
    duration: number | null;
    recordingUrl: string | null;
    summary: { topics: string[] } | null;
  }>;
  totalCount?: number;
}

function DownloadButton({ meetingId, title }: { meetingId: string; title: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recordings/download/${meetingId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as Record<string, string>).error ?? "Gagal mendapatkan link unduhan");
      }
      const { url, filename } = await res.json() as { url: string; filename?: string };
      const a = document.createElement("a");
      a.href = url;
      a.download = filename ?? `${title.replace(/[^a-z0-9]/gi, "_")}_recording.mp4`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Unduhan dimulai — link berlaku 1 jam");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unduhan gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-medium border border-emerald-500/20 transition-colors disabled:opacity-50"
      title="Unduh rekaman (kualitas asli)"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      {loading ? "Memproses..." : "Unduh"}
    </button>
  );
}

export function RecordingsContent({ meetings, totalCount }: RecordingsContentProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const count = totalCount ?? meetings.length;
  const limitReached = count >= MAX_RECORDINGS;

  if (meetings.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Rekaman</h1>
        <p className="text-xs text-gray-500 mb-8">
          Batas rekaman: {count}/{MAX_RECORDINGS} per akun
        </p>
        <div className="text-center py-20 text-gray-500">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Belum ada rekaman</p>
          <p className="text-xs mt-1">Aktifkan rekaman saat meeting berlangsung</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-white">Rekaman ({meetings.length})</h1>
        <span className={`text-xs px-3 py-1 rounded-full border ${
          limitReached
            ? "border-red-500/30 bg-red-500/10 text-red-400"
            : "border-white/10 bg-white/5 text-gray-400"
        }`}>
          {count}/{MAX_RECORDINGS} slot terpakai
        </span>
      </div>

      {limitReached && (
        <div className="mb-6 flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300 leading-relaxed">
            Batas rekaman ({MAX_RECORDINGS}) tercapai. Hapus rekaman lama untuk merekam sesi baru.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500 mb-6">
        Semua rekaman tersimpan di cloud • Kualitas: Original • Link unduhan berlaku 1 jam
      </p>

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
                type="button"
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

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-xs font-semibold border border-blue-500/20 transition-colors"
                >
                  {expanded === m.id ? (
                    <><ChevronUp className="w-3.5 h-3.5" /> Sembunyikan</>
                  ) : (
                    <><ChevronDown className="w-3.5 h-3.5" /> Putar & Bab AI</>
                  )}
                </button>

                {m.recordingUrl && <DownloadButton meetingId={m.id} title={m.title} />}

                {m.recordingUrl && (m.recordingUrl.startsWith("http://") || m.recordingUrl.startsWith("https://")) && (
                  <a
                    href={m.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs border border-white/10 transition-colors"
                    title="Buka di tab baru"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
