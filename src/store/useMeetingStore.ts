import { create } from "zustand";
import { nanoid } from "nanoid";
import type { ChatMessage } from "@/types/meeting";

interface MeetingStore {
  transcript: string[];
  addTranscriptLine: (line: string) => void;
  clearTranscript: () => void;

  raisedHands: Set<string>;
  raiseHand: (participantId: string) => void;
  lowerHand: (participantId: string) => void;

  reactions: Array<{ id: string; emoji: string; x: number; y: number }>;
  addReaction: (emoji: string) => void;
  removeReaction: (id: string) => void;

  isRecording: boolean;
  setRecording: (v: boolean) => void;
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  transcript: [],
  addTranscriptLine: (line) => set((s) => ({ transcript: [...s.transcript, line] })),
  clearTranscript: () => set({ transcript: [] }),

  raisedHands: new Set(),
  raiseHand: (id) => set((s) => ({ raisedHands: new Set([...s.raisedHands, id]) })),
  lowerHand: (id) => set((s) => {
    const next = new Set(s.raisedHands);
    next.delete(id);
    return { raisedHands: next };
  }),

  reactions: [],
  addReaction: (emoji) => {
    const id = nanoid(8);
    const x = 20 + Math.random() * 60;
    const y = 20 + Math.random() * 60;
    set((s) => ({ reactions: [...s.reactions, { id, emoji, x, y }] }));
    setTimeout(() => set((s) => ({ reactions: s.reactions.filter((r) => r.id !== id) })), 2500);
  },
  removeReaction: (id) => set((s) => ({ reactions: s.reactions.filter((r) => r.id !== id) })),

  isRecording: false,
  setRecording: (v) => set({ isRecording: v }),
}));
