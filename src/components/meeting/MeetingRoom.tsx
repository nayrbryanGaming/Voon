"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { VideoGrid } from "./VideoGrid";
import { ControlBar } from "./ControlBar";
import { ChatPanel } from "./ChatPanel";
import { ParticipantsList } from "./ParticipantsList";
import { LiveCaptionsOverlay } from "./LiveCaptionsOverlay";
import { PollWidget } from "./PollWidget";
import { QAPanel } from "./QAPanel";
import { AIQuizModal } from "@/components/ai/AIQuizModal";

interface MeetingRoomProps {
  roomId: string;
  meetingId: string;
  meetingTitle: string;
  userId: string;
  userName: string;
  isHost: boolean;
  guestName?: string;
}

function RoomInner({ meetingId, meetingTitle, isHost, userId, userName }: Omit<MeetingRoomProps, "roomId">) {
  const router = useRouter();
  const [panel, setPanel] = useState<"chat" | "participants" | "polls" | "qa" | null>(null);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const handleLeave = () => {
    router.push(meetingId ? `/meetings/${meetingId}/recap` : "/dashboard");
  };

  return (
    <div className="relative w-full h-screen bg-[var(--voon-bg)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--voon-bg-card)]/80 backdrop-blur-sm border-b border-white/5 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">V</div>
          <span className="text-white font-semibold text-sm truncate max-w-xs">{meetingTitle}</span>
          <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-red-400" />
            LIVE
          </span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden relative">
        <VideoGrid />

        {/* Side panels */}
        {panel === "chat" && (
          <div className="w-80 bg-[var(--voon-bg-card)] border-l border-white/5 flex-shrink-0">
            <ChatPanel />
          </div>
        )}
        {panel === "participants" && (
          <div className="w-72 bg-[var(--voon-bg-card)] border-l border-white/5 flex-shrink-0">
            <ParticipantsList isHost={isHost} />
          </div>
        )}
        {panel === "polls" && (
          <div className="w-72 bg-[var(--voon-bg-card)] border-l border-white/5 flex-shrink-0 overflow-y-auto">
            <PollWidget meetingId={meetingId} isHost={isHost} />
          </div>
        )}
        {panel === "qa" && (
          <div className="w-80 bg-[var(--voon-bg-card)] border-l border-white/5 flex-shrink-0 flex flex-col">
            <QAPanel isHost={isHost} participantName={userName} />
          </div>
        )}

        {captionsEnabled && <LiveCaptionsOverlay />}
      </div>

      {/* Control bar */}
      <ControlBar
        isHost={isHost}
        meetingId={meetingId}
        onLeave={handleLeave}
        onTogglePanel={setPanel}
        activePanel={panel}
        captionsEnabled={captionsEnabled}
        onToggleCaptions={() => setCaptionsEnabled(!captionsEnabled)}
        onOpenQuiz={() => setShowQuiz(true)}
      />

      {showQuiz && <AIQuizModal onClose={() => setShowQuiz(false)} />}

      <RoomAudioRenderer />
    </div>
  );
}

export function MeetingRoom({ roomId, meetingId, meetingTitle, userId, userName, isHost, guestName }: MeetingRoomProps) {
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/livekit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName: roomId, isHost, ...(guestName ? { guestName } : {}) }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setToken(data.token);
        setServerUrl(data.serverUrl);
      })
      .catch((e) => setError(e.message));
  }, [roomId, isHost]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--voon-bg)]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/dashboard" className="text-blue-400 hover:text-blue-300">
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--voon-bg)]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Menghubungkan ke meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={true}
      onDisconnected={() => window.location.href = meetingId ? `/meetings/${meetingId}/recap` : "/dashboard"}
    >
      <RoomInner
        meetingId={meetingId}
        meetingTitle={meetingTitle}
        isHost={isHost}
        userId={userId}
        userName={userName ?? "Peserta"}
      />
    </LiveKitRoom>
  );
}
