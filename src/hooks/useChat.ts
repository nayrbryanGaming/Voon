"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDataChannel, useRoomContext } from "@livekit/components-react";
import type { ChatMessage } from "@/types/meeting";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const room = useRoomContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  useDataChannel("chat", (msg) => {
    try {
      const decoded = new TextDecoder().decode(msg.payload);
      const data = JSON.parse(decoded);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), ...data, time: new Date() },
      ]);
    } catch {}
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const sender = room.localParticipant?.name ?? "Anda";
      const data = JSON.stringify({ sender, text: text.trim() });
      room.localParticipant?.publishData(new TextEncoder().encode(data), {
        topic: "chat",
      });
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: "Anda", text: text.trim(), time: new Date() },
      ]);
    },
    [room]
  );

  return { messages, sendMessage, bottomRef };
}
