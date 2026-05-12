"use client";

import { useState, useRef, useEffect } from "react";
import { useDataChannel, useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { Send } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: Date;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const room = useRoomContext();

  useDataChannel("chat", (msg) => {
    const decoded = new TextDecoder().decode(msg.payload);
    const data = JSON.parse(decoded);
    setMessages((prev) => [...prev, { id: Date.now().toString(), ...data, time: new Date() }]);
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const text = input.trim();
    const sender = room.localParticipant?.name ?? "Anda";
    const data = JSON.stringify({ sender, text });
    room.localParticipant?.publishData(new TextEncoder().encode(data), { topic: "chat" });
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "Anda", text, time: new Date() },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-white font-semibold text-sm">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-600 text-xs text-center pt-8">Mulai percakapan...</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-400">{msg.sender}</span>
              <span className="text-xs text-gray-600">{formatTime(msg.time)}</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{msg.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-3 border-t border-white/5">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Tulis pesan..."
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
          />
          <button
            onClick={sendMessage}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
