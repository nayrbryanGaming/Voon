"use client";

import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { VideoPresets } from "livekit-client";
import { ArrowLeft, WifiOff } from "lucide-react";
import { VideoGrid } from "./VideoGrid";
import { ControlBar } from "./ControlBar";

const ChatPanel       = lazy(() => import("./ChatPanel").then(m => ({ default: m.ChatPanel })));
const ParticipantsList = lazy(() => import("./ParticipantsList").then(m => ({ default: m.ParticipantsList })));
const LiveCaptionsOverlay = lazy(() => import("./LiveCaptionsOverlay").then(m => ({ default: m.LiveCaptionsOverlay })));
const PollWidget      = lazy(() => import("./PollWidget").then(m => ({ default: m.PollWidget })));
const QAPanel         = lazy(() => import("./QAPanel").then(m => ({ default: m.QAPanel })));
const InvitePanel     = lazy(() => import("./InvitePanel").then(m => ({ default: m.InvitePanel })));
const RoomSettings    = lazy(() => import("./RoomSettings").then(m => ({ default: m.RoomSettings })));
const MusicPlayer     = lazy(() => import("./MusicPlayer").then(m => ({ default: m.MusicPlayer })));
const AIQuizModal     = lazy(() => import("@/components/ai/AIQuizModal").then(m => ({ default: m.AIQuizModal })));
const FloatingMiniVideo = lazy(() => import("./FloatingMiniVideo").then(m => ({ default: m.FloatingMiniVideo })));
const AnnotationCanvas = lazy(() => import("./AnnotationCanvas").then(m => ({ default: m.AnnotationCanvas })));
const BackgroundSelectorPanel = lazy(() => import("./BackgroundSelector").then(m => ({ default: m.BackgroundSelectorPanel })));

function PanelLoader() {
  return (
    <div className="flex items-center justify-center h-20">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export interface MeetingRoomProps {
  roomId: string;
  meetingId: string;
  meetingTitle: string;
  userId: string;
  userName: string;
  isHost: boolean;
  guestName?: string;
  inviteCode?: string;
}

type PanelType = "chat" | "participants" | "polls" | "qa" | "invite" | "settings" | "music" | "bg";

function RoomInner({
  meetingId,
  meetingTitle,
  isHost,
  userId: _userId,
  userName,
  guestName,
  roomId,
  inviteCode,
}: MeetingRoomProps) {
  const router = useRouter();
  const room = useRoomContext();
  const [panel, setPanel] = useState<PanelType | null>(null);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [annotating, setAnnotating] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  // Permission state (set by host via DataChannel)
  const [micLocked, setMicLocked] = useState(false);
  const [camLocked, setCamLocked] = useState(false);
  const [chatLocked, setChatLocked] = useState(false);
  const [screenShareLocked, setScreenShareLocked] = useState(false);
  const [mediaAllowed, setMediaAllowed] = useState(true);

  const handleLeave = useCallback(() => {
    try { room.disconnect(); } catch { /* ignore */ }
    if (guestName) {
      router.push("/join");
    } else {
      router.push(meetingId ? `/meetings/${meetingId}/recap` : "/dashboard");
    }
  }, [room, guestName, meetingId, router]);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(guestName ? "/join" : "/dashboard");
    }
  }, [router, guestName]);

  // Auto Picture-in-Picture when user leaves the page/tab
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Set autopictureinpicture on all existing local video elements
    const setAutoPiP = () => {
      document.querySelectorAll<HTMLVideoElement>(".lk-participant-tile[data-lk-local] video").forEach((v) => {
        (v as HTMLVideoElement & { autoPictureInPicture?: boolean }).autoPictureInPicture = true;
      });
    };
    setAutoPiP();

    const handleVisibility = () => {
      if (!document.hidden) return;
      // Try to enter PiP for local video when page becomes hidden
      const localVideo = document.querySelector<HTMLVideoElement>(
        ".lk-participant-tile[data-lk-local] video, video[data-lk-local]"
      );
      if (localVideo && document.pictureInPictureEnabled && !document.pictureInPictureElement) {
        localVideo.requestPictureInPicture().catch(() => {
          // Silently fail — browser may require prior user gesture
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    // Re-apply autopictureinpicture periodically in case LiveKit re-renders tiles
    const interval = setInterval(setAutoPiP, 3000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, []);

  // DataChannel message handler
  useEffect(() => {
    const handler = (payload: Uint8Array) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload)) as Record<string, unknown>;

        switch (msg.type) {
          case "mute-all":
            room.localParticipant?.setMicrophoneEnabled(false);
            break;

          case "disable-cameras-all":
            room.localParticipant?.setCameraEnabled(false);
            break;

          case "meeting-ended":
            window.location.href = guestName
              ? "/join"
              : meetingId ? `/meetings/${meetingId}/recap` : "/dashboard";
            break;

          case "room-permissions":
            if (msg.micLocked !== undefined) setMicLocked(Boolean(msg.micLocked));
            if (msg.camLocked !== undefined) setCamLocked(Boolean(msg.camLocked));
            if (msg.chatLocked !== undefined) setChatLocked(Boolean(msg.chatLocked));
            if (msg.screenShareLocked !== undefined) setScreenShareLocked(Boolean(msg.screenShareLocked));
            if (msg.mediaAllowed !== undefined) setMediaAllowed(Boolean(msg.mediaAllowed));
            // Enforce immediately
            if (msg.micLocked) room.localParticipant?.setMicrophoneEnabled(false);
            if (msg.camLocked) room.localParticipant?.setCameraEnabled(false);
            break;

          default:
            break;
        }
      } catch { /* ignore parse errors */ }
    };
    room.on("dataReceived", handler);
    return () => { room.off("dataReceived", handler); };
  }, [room, guestName, meetingId]);

  const resolvedInviteCode = inviteCode ?? "------";

  return (
    <div className="relative w-full h-[100dvh] bg-[var(--voon-bg)] flex flex-col overflow-hidden">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-3 py-2 bg-[var(--voon-bg-card)] border-b border-white/5 z-10 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            title="Kembali"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-[10px] flex-shrink-0">V</div>
          <span className="text-white font-semibold text-sm truncate">{meetingTitle}</span>

          <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
            <span className="live-dot w-1 h-1 rounded-full bg-red-400" />
            LIVE
          </span>

          {/* Permission indicators */}
          {micLocked && (
            <span className="text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
              Mic dikunci
            </span>
          )}
          {camLocked && (
            <span className="text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
              Kamera dikunci
            </span>
          )}
        </div>

        {/* Right side: leave shortcut */}
        <button
          type="button"
          onClick={handleLeave}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white text-xs font-medium transition-colors border border-red-500/20"
        >
          Keluar
        </button>
      </header>

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        <VideoGrid
          annotating={annotating}
          onScreenShareChange={setIsScreenSharing}
        />

        {/* Side panels */}
        {panel === "chat" && (
          <div className="voon-panel w-80 overflow-y-auto">
            <Suspense fallback={<PanelLoader />}>
              <ChatPanel chatLocked={chatLocked} isHost={isHost} mediaAllowed={mediaAllowed} />
            </Suspense>
          </div>
        )}
        {panel === "participants" && (
          <div className="voon-panel w-72 overflow-y-auto">
            <Suspense fallback={<PanelLoader />}>
              <ParticipantsList isHost={isHost} />
            </Suspense>
          </div>
        )}
        {panel === "polls" && (
          <div className="voon-panel w-72 overflow-y-auto">
            <Suspense fallback={<PanelLoader />}>
              <PollWidget meetingId={meetingId} isHost={isHost} />
            </Suspense>
          </div>
        )}
        {panel === "qa" && (
          <div className="voon-panel w-80 flex flex-col overflow-hidden">
            <Suspense fallback={<PanelLoader />}>
              <QAPanel isHost={isHost} participantName={userName} />
            </Suspense>
          </div>
        )}
        {panel === "invite" && (
          <div className="voon-panel w-80 overflow-y-auto">
            <Suspense fallback={<PanelLoader />}>
              <InvitePanel
                meetingId={meetingId}
                meetingTitle={meetingTitle}
                inviteCode={resolvedInviteCode}
                roomId={roomId}
              />
            </Suspense>
          </div>
        )}
        {panel === "settings" && (
          <div className="voon-panel w-72 overflow-y-auto">
            <Suspense fallback={<PanelLoader />}>
              <RoomSettings
                isHost={isHost}
                meetingId={meetingId}
                micLocked={micLocked}
                camLocked={camLocked}
                chatLocked={chatLocked}
                screenShareLocked={screenShareLocked}
                mediaAllowed={mediaAllowed}
              />
            </Suspense>
          </div>
        )}
        {panel === "music" && (
          <div className="voon-panel w-80 overflow-y-auto">
            <Suspense fallback={<PanelLoader />}><MusicPlayer /></Suspense>
          </div>
        )}
        {panel === "bg" && (
          <div className="voon-panel w-72 overflow-y-auto">
            <Suspense fallback={<PanelLoader />}><BackgroundSelectorPanel /></Suspense>
          </div>
        )}

        {captionsEnabled && (
          <Suspense fallback={null}><LiveCaptionsOverlay /></Suspense>
        )}

        {/* Annotation canvas overlay — shown during screen share when annotating */}
        {annotating && isScreenSharing && (
          <Suspense fallback={null}>
            <AnnotationCanvas onClose={() => setAnnotating(false)} />
          </Suspense>
        )}
      </div>

      {/* ── Control bar ───────────────────────────────────────── */}
      <ControlBar
        isHost={isHost}
        meetingId={meetingId}
        onLeave={handleLeave}
        onTogglePanel={setPanel}
        activePanel={panel}
        captionsEnabled={captionsEnabled}
        onToggleCaptions={() => setCaptionsEnabled((p) => !p)}
        onOpenQuiz={() => setShowQuiz(true)}
        annotating={annotating}
        onToggleAnnotation={() => setAnnotating((p) => !p)}
        isScreenSharing={isScreenSharing}
        micLocked={micLocked}
        camLocked={camLocked}
      />

      {showQuiz && (
        <Suspense fallback={null}>
          <AIQuizModal onClose={() => setShowQuiz(false)} />
        </Suspense>
      )}

      {/* Mobile draggable self-view */}
      <Suspense fallback={null}><FloatingMiniVideo /></Suspense>

      <RoomAudioRenderer />
    </div>
  );
}

export function MeetingRoom({
  roomId,
  meetingId,
  meetingTitle,
  userId,
  userName,
  isHost,
  guestName,
  inviteCode,
}: MeetingRoomProps) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [error, setError] = useState("");
  const [wasConnected, setWasConnected] = useState(false);

  useEffect(() => {
    fetch("/api/livekit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName: roomId, isHost, ...(guestName ? { guestName } : {}) }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        if (!data.serverUrl) {
          setError("LiveKit server tidak dikonfigurasi. Hubungi administrator.");
          return;
        }
        setToken(data.token);
        setServerUrl(data.serverUrl);
      })
      .catch((e: Error) => setError(e.message));
  }, [roomId, isHost, guestName]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(guestName ? "/join" : "/dashboard");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--voon-bg)]">
        <div className="text-center max-w-sm px-4">
          <WifiOff className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-2 font-medium">Gagal Terhubung</p>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
            <a
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--voon-bg)] gap-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Menghubungkan ke meeting...</p>
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Batal
        </button>
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
      options={{
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: true,
          videoSimulcastLayers: [VideoPresets.h90, VideoPresets.h216],
          dtx: true,
          red: true,
          videoCodec: "vp8",
          backupCodec: false,
        },
        videoCaptureDefaults: {
          resolution: VideoPresets.h360.resolution,
        },
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        },
        stopLocalTrackOnUnpublish: true,
        disconnectOnPageLeave: true,
      }}
      onConnected={() => setWasConnected(true)}
      onDisconnected={() => {
        if (wasConnected) {
          if (guestName) {
            window.location.href = "/join";
          } else {
            window.location.href = meetingId ? `/meetings/${meetingId}/recap` : "/dashboard";
          }
        }
      }}
    >
      <RoomInner
        roomId={roomId}
        meetingId={meetingId}
        meetingTitle={meetingTitle}
        isHost={isHost}
        userId={userId}
        userName={userName ?? "Peserta"}
        guestName={guestName}
        inviteCode={inviteCode}
      />
    </LiveKitRoom>
  );
}
