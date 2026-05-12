"use client";

import { useState, useCallback, useRef } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";

interface Caption {
  id: string;
  text: string;
  final: boolean;
  timestamp: Date;
}

export function useCaptions() {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [enabled, setEnabled] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const addTranscriptLine = useMeetingStore((s) => s.addTranscriptLine);

  const start = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "id-ID";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const text: string = result[0].transcript;
      const isFinal: boolean = result.isFinal;
      const id = `cap-${event.results.length}`;

      setCaptions((prev) => {
        const existing = prev.find((c) => c.id === id);
        if (existing) {
          return prev.map((c) => c.id === id ? { ...c, text, final: isFinal } : c);
        }
        return [...prev.slice(-3), { id, text, final: isFinal, timestamp: new Date() }];
      });

      if (isFinal) addTranscriptLine(text);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setEnabled(true);
  }, [addTranscriptLine]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setEnabled(false);
  }, []);

  const toggle = useCallback(() => {
    if (enabled) stop();
    else start();
  }, [enabled, start, stop]);

  return { captions, enabled, toggle, start, stop };
}
