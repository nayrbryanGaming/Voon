"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [polls, setPolls] = useState<Poll[]>([]);
  const [creating, setCreating] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const addOption = () => setOptions((o) => [...o, ""]);
  const updateOption = (i: number, val: string) =>
    setOptions((o) => o.map((opt, idx) => (idx === i ? val : opt)));

  const createPoll = async () => {
    if (!question.trim() || options.filter((o) => o.trim()).length < 2) {
      toast.error("Isi pertanyaan dan minimal 2 pilihan");
      return;
    }
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, question, options: options.filter((o) => o.trim()) }),
      });
      if (!res.ok) throw new Error();
      const newPoll = await res.json();
      setPolls((p) => [...p, newPoll]);
      setCreating(false);
      setQuestion("");
      setOptions(["", ""]);
      toast.success("Polling dibuat");
    } catch {
      toast.error("Gagal membuat polling");
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
      const updated = await res.json();
      setPolls((p) => p.map((poll) => (poll.id === pollId ? updated : poll)));
    } catch {
      toast.error("Gagal vote");
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">Polling</span>
        {isHost && !creating && (
          <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
            + Buat
          </Button>
        )}
      </div>

      {creating && (
        <div className="flex flex-col gap-2 rounded-lg border p-3">
          <input
            className="rounded border px-2 py-1 text-sm"
            placeholder="Pertanyaan..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          {options.map((opt, i) => (
            <input
              key={i}
              className="rounded border px-2 py-1 text-sm"
              placeholder={`Pilihan ${i + 1}`}
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
            />
          ))}
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={addOption}>+ Pilihan</Button>
            <Button size="sm" onClick={createPoll}>Buat</Button>
            <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>Batal</Button>
          </div>
        </div>
      )}

      {polls.length === 0 && !creating && (
        <p className="text-xs text-muted-foreground text-center py-4">Belum ada polling</p>
      )}

      {polls.map((poll) => (
        <div key={poll.id} className="rounded-lg border p-3 flex flex-col gap-2">
          <p className="text-sm font-medium">{poll.question}</p>
          {poll.options.map((opt) => {
            const voteCount = poll.votes?.[opt] ?? 0;
            const pct = poll.totalVotes > 0 ? Math.round((voteCount / poll.totalVotes) * 100) : 0;
            return (
              <button
                key={opt}
                disabled={poll.voted}
                onClick={() => vote(poll.id, opt)}
                className="w-full text-left rounded border px-3 py-1.5 text-sm hover:bg-accent disabled:cursor-default relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 bg-primary/10 transition-all"
                  style={{ width: `${pct}%` }}
                />
                <span className="relative flex justify-between">
                  <span>{opt}</span>
                  {poll.voted && <span className="text-muted-foreground">{pct}%</span>}
                </span>
              </button>
            );
          })}
          <p className="text-xs text-muted-foreground">{poll.totalVotes} suara</p>
        </div>
      ))}
    </div>
  );
}
