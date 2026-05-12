"use client";

import { useState } from "react";
import { Brain, X, Check, AlertCircle, RefreshCw } from "lucide-react";
import type { Quiz, QuizQuestion } from "@/types/ai";
import { useMeetingStore } from "@/store/useMeetingStore";

interface AIQuizModalProps {
  onClose: () => void;
}

export function AIQuizModal({ onClose }: AIQuizModalProps) {
  const transcript = useMeetingStore((s) => s.transcript);
  const [step, setStep] = useState<"config" | "loading" | "quiz" | "result">("config");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [error, setError] = useState("");

  const generateQuiz = async () => {
    setStep("loading");
    setError("");
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcript.join("\n") || "Materi perkuliahan",
          topic: "Materi Meeting",
          difficulty,
        }),
      });
      if (!res.ok) throw new Error("Gagal membuat kuis");
      const data = await res.json();
      setQuiz(data);
      setAnswers(new Array(data.questions.length).fill(-1));
      setStep("quiz");
    } catch {
      setError("Gagal membuat kuis. Coba lagi.");
      setStep("config");
    }
  };

  const score = quiz
    ? quiz.questions.filter((q, i) => answers[i] === q.correct).length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--voon-bg-card)] border border-white/10 rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h2 className="text-white font-semibold">AI Quiz Generator</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "config" && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Buat kuis otomatis dari materi yang dibahas dalam meeting ini.
            </p>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Tingkat Kesulitan</label>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      difficulty === d
                        ? "bg-purple-600 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {d === "easy" ? "Mudah" : d === "medium" ? "Sedang" : "Sulit"}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={generateQuiz}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors"
            >
              Buat Kuis (5 Soal)
            </button>
          </div>
        )}

        {step === "loading" && (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">AI sedang membuat soal kuis...</p>
          </div>
        )}

        {step === "quiz" && quiz && (
          <div className="space-y-6">
            {quiz.questions.map((q, qi) => (
              <div key={qi} className="space-y-2">
                <p className="text-white text-sm font-medium">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers((prev) => {
                        const next = [...prev];
                        next[qi] = oi;
                        return next;
                      })}
                      className={`w-full text-left p-3 rounded-xl text-sm transition-colors border ${
                        answers[qi] === oi
                          ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
                          : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => setStep("result")}
              disabled={answers.some((a) => a === -1)}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
            >
              Kumpulkan Jawaban
            </button>
          </div>
        )}

        {step === "result" && quiz && (
          <div className="space-y-4">
            <div className="text-center p-6 rounded-2xl bg-purple-600/10 border border-purple-500/20">
              <p className="text-5xl font-bold text-white mb-2">{score}/{quiz.questions.length}</p>
              <p className="text-gray-400">
                {score === quiz.questions.length ? "Sempurna! 🎉" : score >= quiz.questions.length / 2 ? "Bagus! 👍" : "Perlu belajar lagi 📚"}
              </p>
            </div>
            {quiz.questions.map((q, qi) => (
              <div key={qi} className={`p-3 rounded-xl border text-sm ${answers[qi] === q.correct ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                <div className="flex items-start gap-2">
                  {answers[qi] === q.correct ? (
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-white">{q.question}</p>
                    <p className="text-xs text-gray-500 mt-1">{q.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => { setStep("config"); setQuiz(null); setAnswers([]); }}
              className="w-full py-2.5 border border-white/10 text-gray-300 rounded-xl text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Buat Kuis Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
