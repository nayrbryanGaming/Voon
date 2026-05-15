"use client";

import { useState, useEffect } from "react";
import { useRoomContext } from "@livekit/components-react";
import { toast } from "sonner";

interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  totalVotes: number;
  voted: boolean;
}

interface PollWidgetProps {
  meetingId: string;
  isHost: boolean;
}

export function PollWidget({ meetingId, isHost }: PollWidgetProps) {
  const room = useRoomContext();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [creating, setCreating] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(true);

  // Load polls on mount
  useEffect(() => {
    fetch(`/api/polls?meetingId=${encodeURIComponent(meetingId)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load polls");
        return r.json();
      })
      .then((data: Poll[]) => {
        // Compute totalVotes from votes object
        const enriched = data.map((p) => {
          const votesCounted = Object.entries(p.votes || {})
            .filter(([k]) => !k.startsWith("__voter_"))
            .reduce((sum, [, v]) => sum + (v as number), 0);
          return { ...p, totalVotes: votesCounted, voted: false };
        });
        setPolls(enriched);
      })
      .catch(() => {
        // Guests or unauthenticated — silently ignore
      })
      .finally(() => setLoading(false));
  }, [meetingId]);

  // Listen for poll broadcast from DataChannel
  useEffect(() => {
    const handler = (payload: Uint8Array) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === "new-poll" && msg.poll) {
          setPolls((prev) => {
            if (prev.find((p) => p.id === msg.poll.id)) return prev;
            return [...prev, { ...msg.poll, voted: false }];
          });
        }
        if (msg.type === "poll-updated" && msg.poll) {
          setPolls((prev) =>
            prev.map((p) => (p.id === msg.poll.id ? { ...msg.poll, voted: p.voted } : p))
          );
        }
      } catch {
        // ignore parse errors
      }
    };
    room.on("dataReceived", handler);
    return () => { room.off("dataReceived", handler); };
  }, [room]);

  const addOption = () => setOptions((o) => [...o, ""]);
  const updateOption = (i: number, val: string) =>
    setOptions((o) => o.map((opt, idx) => (idx === i ? val : opt)));

  const createPoll = async () => {
    if (question.trim().length < 5) {
      toast.error("Pertanyaan minimal 5 karakter");
      return;
    }
    const validOptions = options.filter((o) => o.trim().length > 0);
    if (validOptions.length < 2) {
      toast.error("Minimal 2 pilihan jawaban");
      return;
    }
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, question: question.trim(), options: validOptions }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal membuat polling");
      }
      const newPoll: Poll = await res.json();
      const enriched: Poll = { ...newPoll, totalVotes: newPoll.totalVotes ?? 0, voted: false };
      setPolls((p) => [...p, enriched]);

      // Broadcast new poll to all participants via DataChannel
      const data = JSON.stringify({ type: "new-poll", poll: enriched });
      room.localParticipant?.publishData(new TextEncoder().encode(data));

      setCreating(false);
      setQuestion("");
      setOptions(["", ""]);
      toast.success("Polling dibuat");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal membuat polling");
    }
  };

  const vote = async (pollId: string, option: string) => {
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option }),
      });
      if (!res.ok) throw new Error();
      const updated: Poll = await res.json();
      const votesCounted = Object.entries(updated.votes || {})
        .filter(([k]) => !k.startsWith("__voter_"))
        .reduce((sum, [, v]) => sum + (v as number), 0);
      const enriched = { ...updated, totalVotes: votesCounted, voted: true };
      setPolls((p) => p.map((poll) => (poll.id === pollId ? enriched : poll)));

      // Broadcast updated poll
      const data = JSON.stringify({ type: "poll-updated", poll: enriched });
      room.localParticipant?.publishData(new TextEncoder().encode(data));
    } catch {
      toast.error("Gagal vote");
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-[var(--voon-bg-elevated)] min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm text-white">Polling</span>
        {isHost && !creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="text-xs px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            + Buat
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-[var(--voon-bg-card)] p-3">
          <input
            className="rounded-lg border border-white/10 bg-[var(--voon-bg)] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Pertanyaan (min. 5 karakter)..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            {question.trim().length}/5 karakter minimum
          </p>
          {options.map((opt, i) => (
            <input
              key={i}
              className="rounded-lg border border-white/10 bg-[var(--voon-bg)] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder={`Pilihan ${i + 1}`}
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
            />
          ))}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={addOption}
              className="text-xs px-2 py-1 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
            >
              + Pilihan
            </button>
            <button
              type="button"
              onClick={createPoll}
              className="text-xs px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Buat
            </button>
            <button
              type="button"
              onClick={() => { setCreating(false); setQuestion(""); setOptions(["", ""]); }}
              className="text-xs px-2 py-1 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {loading && (
        <p className="text-xs text-gray-500 text-center py-4">Memuat polling...</p>
      )}
      {!loading && polls.length === 0 && !creating && (
        <p className="text-xs text-gray-500 text-center py-4">Belum ada polling</p>
      )}

      {/* Poll list */}
      {polls.map((poll) => (
        <div key={poll.id} className="rounded-xl border border-white/10 bg-[var(--voon-bg-card)] p-3 flex flex-col gap-2">
          <p className="text-sm font-medium text-white">{poll.question}</p>
          {poll.options.map((opt) => {
            const voteCount = poll.votes?.[opt] ?? 0;
            const pct = poll.totalVotes > 0 ? Math.round((voteCount / poll.totalVotes) * 100) : 0;
            return (
              <button
                key={opt}
                type="button"
                disabled={poll.voted}
                onClick={() => vote(poll.id, opt)}
                className="w-full text-left rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:border-blue-500/50 disabled:cursor-default relative overflow-hidden transition-colors"
              >
                {/* Progress fill */}
                <div
                  className="absolute inset-0 bg-blue-600/20 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
                <span className="relative flex justify-between items-center">
                  <span>{opt}</span>
                  {poll.voted && (
                    <span className="text-gray-400 text-xs ml-2 flex-shrink-0">{pct}%</span>
                  )}
                </span>
              </button>
            );
          })}
          <p className="text-xs text-gray-500">{poll.totalVotes} suara</p>
        </div>
      ))}
    </div>
  );
}
