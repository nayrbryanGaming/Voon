"use client";

import { useState, useEffect, useCallback } from "react";
import { useRoomContext } from "@livekit/components-react";
import { DataPacket_Kind } from "livekit-client";
import { HelpCircle, Send, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QAQuestion {
  id: string;
  text: string;
  author: string; // "Anonim" or display name
  timestamp: number;
  answered: boolean;
  upvotes: number;
  upvotedByMe: boolean;
}

interface QAPanelProps {
  isHost: boolean;
  participantName: string;
}

export function QAPanel({ isHost, participantName }: QAPanelProps) {
  const room = useRoomContext();
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAnon, setIsAnon] = useState(true);

  // Send data via LiveKit DataChannel
  const sendData = useCallback(
    (payload: object) => {
      try {
        const data = new TextEncoder().encode(JSON.stringify(payload));
        room.localParticipant?.publishData(data, { reliable: true });
      } catch {
        // ignore
      }
    },
    [room.localParticipant]
  );

  // Listen for incoming Q&A messages
  useEffect(() => {
    const onData = (data: Uint8Array) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(data));
        if (!msg || msg.type !== "qa") return;

        setQuestions((prev) => {
          switch (msg.action) {
            case "new": {
              // Avoid duplicates
              if (prev.find((q) => q.id === msg.question.id)) return prev;
              return [...prev, msg.question];
            }
            case "answer": {
              return prev.map((q) =>
                q.id === msg.questionId ? { ...q, answered: true } : q
              );
            }
            case "delete": {
              return prev.filter((q) => q.id !== msg.questionId);
            }
            case "upvote": {
              return prev.map((q) =>
                q.id === msg.questionId ? { ...q, upvotes: msg.upvotes } : q
              );
            }
            default:
              return prev;
          }
        });
      } catch {
        // ignore malformed
      }
    };

    room.on("dataReceived", onData);
    return () => {
      room.off("dataReceived", onData);
    };
  }, [room]);

  const submitQuestion = () => {
    const text = inputText.trim();
    if (!text || text.length < 5) return;

    const question: QAQuestion = {
      id: crypto.randomUUID(),
      text,
      author: isAnon ? "Anonim" : participantName,
      timestamp: Date.now(),
      answered: false,
      upvotes: 0,
      upvotedByMe: false,
    };

    // Optimistically add locally
    setQuestions((prev) => [...prev, question]);

    // Broadcast to room
    sendData({ type: "qa", action: "new", question });
    setInputText("");
  };

  const markAnswered = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, answered: true } : q))
    );
    sendData({ type: "qa", action: "answer", questionId });
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    sendData({ type: "qa", action: "delete", questionId });
  };

  const upvote = (q: QAQuestion) => {
    if (q.upvotedByMe) return;
    const newCount = q.upvotes + 1;
    setQuestions((prev) =>
      prev.map((item) =>
        item.id === q.id
          ? { ...item, upvotes: newCount, upvotedByMe: true }
          : item
      )
    );
    sendData({ type: "qa", action: "upvote", questionId: q.id, upvotes: newCount });
  };

  const pending = questions.filter((q) => !q.answered);
  const answered = questions.filter((q) => q.answered);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-white/5">
        <HelpCircle className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Tanya Jawab</h3>
        {pending.length > 0 && (
          <span className="ml-auto text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">
            {pending.length}
          </span>
        )}
      </div>

      {/* Questions list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {questions.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada pertanyaan</p>
            <p className="text-xs mt-1">Jadilah yang pertama bertanya!</p>
          </div>
        )}

        {/* Pending questions */}
        {pending.length > 0 && (
          <div className="space-y-2">
            {[...pending]
              .sort((a, b) => b.upvotes - a.upvotes)
              .map((q) => (
                <div
                  key={q.id}
                  className="bg-[var(--voon-bg-elevated)] rounded-xl p-3 border border-white/5"
                >
                  <p className="text-sm text-white">{q.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{q.author}</span>
                      <button
                        type="button"
                        onClick={() => upvote(q)}
                        disabled={q.upvotedByMe}
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full transition-colors",
                          q.upvotedByMe
                            ? "bg-blue-600/20 text-blue-400"
                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                        )}
                      >
                        👍 {q.upvotes > 0 ? q.upvotes : ""}
                      </button>
                    </div>
                    {isHost && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => markAnswered(q.id)}
                          title="Tandai terjawab"
                          className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteQuestion(q.id)}
                          title="Hapus pertanyaan"
                          className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Answered questions */}
        {answered.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sudah Dijawab</p>
            <div className="space-y-1.5">
              {answered.map((q) => (
                <div
                  key={q.id}
                  className="bg-[var(--voon-bg-elevated)]/50 rounded-xl p-2.5 border border-white/5 opacity-60"
                >
                  <p className="text-xs text-gray-400 line-through">{q.text}</p>
                  <span className="text-xs text-emerald-500">✓ Terjawab · {q.author}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5 space-y-2">
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnon}
            onChange={(e) => setIsAnon(e.target.checked)}
            className="w-3.5 h-3.5 accent-blue-600"
          />
          Kirim sebagai anonim
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitQuestion()}
            placeholder="Tulis pertanyaanmu..."
            maxLength={280}
            className="flex-1 px-3 py-2 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
          />
          <button
            type="button"
            onClick={submitQuestion}
            disabled={inputText.trim().length < 5}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
