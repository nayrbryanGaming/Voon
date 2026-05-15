"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDataChannel, useRoomContext } from "@livekit/components-react";
import { Send, Paperclip, Image, Film, Loader2, X } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { toast } from "sonner";

type MsgType = "text" | "image" | "gif" | "video";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  type: MsgType;
  mediaUrl?: string;
  time: Date;
}

interface ChatPanelProps {
  chatLocked?: boolean;
  isHost?: boolean;
  mediaAllowed?: boolean; // host permission: can participants send media?
}

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm"];

export function ChatPanel({ chatLocked = false, isHost = false, mediaAllowed = true }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [attachPreview, setAttachPreview] = useState<{ url: string; type: MsgType; file: File } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const room = useRoomContext();
  const canSend = !chatLocked || isHost;
  const canMedia = isHost || mediaAllowed;

  useDataChannel("chat", (msg) => {
    try {
      const decoded = new TextDecoder().decode(msg.payload);
      const data = JSON.parse(decoded) as Partial<ChatMessage>;
      if (typeof data.sender === "string" && (typeof data.text === "string" || data.mediaUrl)) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: data.sender!,
            text: data.text ?? "",
            type: data.type ?? "text",
            mediaUrl: data.mediaUrl,
            time: new Date(),
          },
        ]);
      }
    } catch {
      // malformed — ignore
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const publish = useCallback(async (payload: Omit<ChatMessage, "id" | "time">) => {
    const data = JSON.stringify(payload);
    await room.localParticipant?.publishData(new TextEncoder().encode(data), { topic: "chat" });
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), ...payload, time: new Date() },
    ]);
  }, [room]);

  const sendMessage = useCallback(async () => {
    if (!canSend) return;

    // If there's an attachment pending, send it
    if (attachPreview) {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", attachPreview.file);
        fd.append("bucket", "attachments");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as Record<string, string>;
          throw new Error(err.error ?? "Upload gagal");
        }
        const { url } = await res.json() as { url: string };
        await publish({
          sender: room.localParticipant?.name ?? "Anda",
          text: input.trim() || attachPreview.file.name,
          type: attachPreview.type,
          mediaUrl: url,
        });
        setAttachPreview(null);
        setInput("");
        setSendError(null);
      } catch (e: unknown) {
        setSendError(e instanceof Error ? e.message : "Gagal mengirim media");
      } finally {
        setUploading(false);
      }
      return;
    }

    if (!input.trim()) return;
    const text = input.trim().slice(0, 1000);
    try {
      await publish({ sender: room.localParticipant?.name ?? "Anda", text, type: "text" });
      setInput("");
      setSendError(null);
    } catch {
      setSendError("Gagal mengirim pesan. Coba lagi.");
    }
  }, [canSend, attachPreview, input, room, publish]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.size > MAX_FILE_BYTES) {
      toast.error("File terlalu besar (maks 10 MB)");
      return;
    }

    const isImage = ALLOWED_IMAGE.includes(file.type);
    const isVideo = ALLOWED_VIDEO.includes(file.type);
    if (!isImage && !isVideo) {
      toast.error("Format tidak didukung. Gunakan JPG, PNG, GIF, MP4, atau WebM.");
      return;
    }

    const type: MsgType = file.type === "image/gif" ? "gif" : isImage ? "image" : "video";
    const url = URL.createObjectURL(file);
    setAttachPreview({ url, type, file });
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-white font-semibold text-sm">Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-600 text-xs text-center pt-8">Mulai percakapan...</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-400">{msg.sender}</span>
              <span className="text-xs text-gray-600">{formatTime(msg.time)}</span>
            </div>

            {(msg.type === "image" || msg.type === "gif") && msg.mediaUrl && (
              <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={msg.mediaUrl}
                  alt={msg.text || "gambar"}
                  className="max-w-full rounded-lg max-h-48 object-contain bg-white/5 border border-white/10"
                />
              </a>
            )}

            {msg.type === "video" && msg.mediaUrl && (
              <video
                src={msg.mediaUrl}
                controls
                className="max-w-full rounded-lg max-h-48 bg-black border border-white/10"
                preload="metadata"
              />
            )}

            {(msg.type === "text" || !msg.mediaUrl) && msg.text && (
              <p className="text-sm text-gray-300 leading-relaxed break-words">{msg.text}</p>
            )}

            {msg.mediaUrl && msg.text && msg.type !== "text" && (
              <p className="text-xs text-gray-500 break-words">{msg.text}</p>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {sendError && (
        <p className="px-3 pb-1 text-xs text-red-400">{sendError}</p>
      )}

      {chatLocked && !isHost && (
        <div className="px-4 py-2 bg-orange-500/10 border-t border-orange-500/20 text-xs text-orange-400 text-center">
          Chat dikunci oleh host
        </div>
      )}

      {/* Attachment preview */}
      {attachPreview && (
        <div className="px-3 pt-2">
          <div className="relative inline-block rounded-xl overflow-hidden border border-blue-500/30 bg-white/5">
            {attachPreview.type === "video" ? (
              <video src={attachPreview.url} className="h-20 max-w-full rounded-lg" preload="metadata" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={attachPreview.url} alt="preview" className="h-20 max-w-full rounded-lg object-contain" />
            )}
            <button
              type="button"
              onClick={() => { setAttachPreview(null); URL.revokeObjectURL(attachPreview.url); }}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-3 py-3 border-t border-white/5">
        <div className="flex gap-2 items-end">
          {canSend && canMedia && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !!attachPreview}
                title="Kirim gambar / GIF / video"
                className="p-2 text-gray-500 hover:text-gray-300 hover:bg-white/10 rounded-xl transition-colors flex-shrink-0 disabled:opacity-40"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={[...ALLOWED_IMAGE, ...ALLOWED_VIDEO].join(",")}
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          )}

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={canSend ? (attachPreview ? "Tambah caption (opsional)..." : "Tulis pesan...") : "Chat dikunci"}
            maxLength={1000}
            disabled={!canSend || uploading}
            aria-label="Pesan chat"
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={!canSend || uploading || (!input.trim() && !attachPreview)}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : attachPreview ? (
              <Image className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {canSend && canMedia && (
          <p className="text-[10px] text-gray-700 mt-1.5 text-center">
            JPG · PNG · GIF · MP4 · WebM (maks 10 MB)
            {!canMedia && !isHost && <span className="text-orange-500"> · Media dinonaktifkan host</span>}
          </p>
        )}

        {canSend && !canMedia && !isHost && (
          <div className="mt-2 flex items-center gap-1 text-xs text-orange-400">
            <Film className="w-3 h-3" />
            Host menonaktifkan pengiriman media
          </div>
        )}
      </div>
    </div>
  );
}
