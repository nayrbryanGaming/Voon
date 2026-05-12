"use client";

import { useState } from "react";
import {
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, MessageSquare, Users,
  BarChart2, Brain, Hand, Smile, LogOut, Subtitles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlBarProps {
  isHost: boolean;
  onLeave: () => void;
  onTogglePanel: (panel: "chat" | "participants" | "quiz" | null) => void;
  activePanel: string | null;
  captionsEnabled: boolean;
  onToggleCaptions: () => void;
  onOpenQuiz: () => void;
}

const REACTIONS = ["👋", "👍", "❤️", "😂", "🎉", "🤔", "👏", "🔥"];

export function ControlBar({
  isHost,
  onLeave,
  onTogglePanel,
  activePanel,
  captionsEnabled,
  onToggleCaptions,
  onOpenQuiz,
}: ControlBarProps) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [showReactions, setShowReactions] = useState(false);
  const [sharing, setSharing] = useState(false);

  const isMuted = !localParticipant?.isMicrophoneEnabled;
  const isCamOff = !localParticipant?.isCameraEnabled;

  const toggleMic = () => localParticipant?.setMicrophoneEnabled(isMuted);
  const toggleCam = () => localParticipant?.setCameraEnabled(isCamOff);

  const toggleScreenShare = async () => {
    if (sharing) {
      await localParticipant?.setScreenShareEnabled(false);
      setSharing(false);
    } else {
      await localParticipant?.setScreenShareEnabled(true);
      setSharing(true);
    }
  };

  const sendReaction = (emoji: string) => {
    const data = JSON.stringify({ type: "reaction", emoji });
    room.localParticipant?.publishData(new TextEncoder().encode(data));
    setShowReactions(false);
  };

  const raiseHand = () => {
    const data = JSON.stringify({ type: "raise-hand" });
    room.localParticipant?.publishData(new TextEncoder().encode(data));
  };

  const panelBtn = (panelName: "chat" | "participants", Icon: React.ElementType, label: string) => (
    <button
      onClick={() => onTogglePanel(activePanel === panelName ? null : panelName)}
      title={label}
      className={cn(
        "flex flex-col items-center gap-1 p-3 rounded-xl transition-colors",
        activePanel === panelName ? "bg-blue-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs hidden sm:block">{label}</span>
    </button>
  );

  return (
    <div className="relative flex items-center justify-center gap-2 p-3 bg-[var(--voon-bg-card)]/90 backdrop-blur-md border-t border-white/5">
      {/* Reactions popup */}
      {showReactions && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 p-3 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-2xl">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="text-2xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Mic */}
      <button
        onClick={toggleMic}
        title={isMuted ? "Aktifkan Mic" : "Matikan Mic"}
        className={cn(
          "flex flex-col items-center gap-1 p-3 rounded-xl transition-colors",
          isMuted ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/10 text-white hover:bg-white/20"
        )}
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        <span className="text-xs hidden sm:block">{isMuted ? "Mic Off" : "Mic"}</span>
      </button>

      {/* Camera */}
      <button
        onClick={toggleCam}
        title={isCamOff ? "Aktifkan Kamera" : "Matikan Kamera"}
        className={cn(
          "flex flex-col items-center gap-1 p-3 rounded-xl transition-colors",
          isCamOff ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/10 text-white hover:bg-white/20"
        )}
      >
        {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        <span className="text-xs hidden sm:block">{isCamOff ? "Cam Off" : "Kamera"}</span>
      </button>

      {/* Screen share */}
      <button
        onClick={toggleScreenShare}
        title="Berbagi Layar"
        className={cn(
          "flex flex-col items-center gap-1 p-3 rounded-xl transition-colors",
          sharing ? "bg-blue-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
        )}
      >
        {sharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        <span className="text-xs hidden sm:block">Layar</span>
      </button>

      {/* Reactions */}
      <button
        onClick={() => setShowReactions(!showReactions)}
        className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <Smile className="w-5 h-5" />
        <span className="text-xs hidden sm:block">Reaksi</span>
      </button>

      {/* Raise hand */}
      <button
        onClick={raiseHand}
        className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <Hand className="w-5 h-5" />
        <span className="text-xs hidden sm:block">Tangan</span>
      </button>

      <div className="w-px h-8 bg-white/10" />

      {panelBtn("chat", MessageSquare, "Chat")}
      {panelBtn("participants", Users, "Peserta")}

      {/* Captions */}
      <button
        onClick={onToggleCaptions}
        className={cn(
          "flex flex-col items-center gap-1 p-3 rounded-xl transition-colors",
          captionsEnabled ? "bg-blue-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
        )}
      >
        <Subtitles className="w-5 h-5" />
        <span className="text-xs hidden sm:block">Caption</span>
      </button>

      {/* AI Quiz (host only) */}
      {isHost && (
        <button
          onClick={onOpenQuiz}
          className="flex flex-col items-center gap-1 p-3 rounded-xl bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/20 transition-colors"
        >
          <Brain className="w-5 h-5" />
          <span className="text-xs hidden sm:block">AI Quiz</span>
        </button>
      )}

      <div className="w-px h-8 bg-white/10" />

      {/* Leave */}
      <button
        onClick={onLeave}
        className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-xs hidden sm:block">Keluar</span>
      </button>
    </div>
  );
}
