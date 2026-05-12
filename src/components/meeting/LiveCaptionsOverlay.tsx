"use client";

import { useState, useEffect, useRef } from "react";

interface Caption {
  id: string;
  text: string;
  final: boolean;
}

export function LiveCaptionsOverlay() {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "id-ID";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      const isFinal = result.isFinal;
      const id = `caption-${event.results.length}`;

      setCaptions((prev) => {
        const existing = prev.find((c) => c.id === id);
        if (existing) {
          return prev.map((c) => c.id === id ? { ...c, text, final: isFinal } : c);
        }
        return [...prev.slice(-2), { id, text, final: isFinal }];
      });
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, []);

  if (captions.length === 0) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4 pointer-events-none z-10">
      <div className="bg-black/80 backdrop-blur-sm rounded-2xl px-6 py-3 text-center">
        {captions.slice(-2).map((caption) => (
          <p
            key={caption.id}
            className={caption.final ? "text-white text-lg" : "text-gray-400 text-base italic"}
          >
            {caption.text}
          </p>
        ))}
      </div>
    </div>
  );
}
