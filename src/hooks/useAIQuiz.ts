"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useMeetingStore } from "@/store/useMeetingStore";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export function useAIQuiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const transcript = useMeetingStore((s) => s.transcript);

  const generateQuiz = useCallback(async () => {
    const text = transcript.join(" ");
    if (!text.trim()) {
      toast.error("Belum ada transkrip untuk membuat kuis");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, topic: "Materi rapat", difficulty: "medium" }),
      });
      if (!res.ok) throw new Error("Failed to generate quiz");
      const data = await res.json();
      setQuestions(data.questions ?? []);
      setOpen(true);
    } catch {
      toast.error("Gagal membuat kuis AI");
    } finally {
      setLoading(false);
    }
  }, [transcript]);

  return { questions, loading, open, setOpen, generateQuiz };
}
