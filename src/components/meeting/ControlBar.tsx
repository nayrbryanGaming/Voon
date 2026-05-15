"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, MessageSquare, Users,
  Brain, Hand, Smile, LogOut, Subtitles, Circle, StopCircle, BarChart2, HelpCircle,
  Link2, Settings, Music, PictureInPicture2, Volume2, VolumeX, ChevronUp,
  MonitorPlay, Pencil, PencilOff, ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecording } from "@/hooks/useRecording";
import { NoiseToggle } from "./NoiseToggle";
import type { ScreenShareCaptureOptions } from "livekit-client";

type PanelType = "chat" | "participants" | "polls" | "qa" | "invite" | "settings" | "music" | "bg";

interface ControlBarProps {
  isHost: boolean;
  meetingId: string;
  onLeave: () => void;
  onTogglePanel: (panel: PanelType | null) => void;
  activePanel: string | null;
  captionsEnabled: boolean;
  onToggleCaptions: () => void;
  onOpenQuiz: () => void;
  annotating: boolean;
  onToggleAnnotation: () => void;
  isScreenSharing: boolean;
  micLocked?: boolean;
  camLocked?: boolean;
}

const REACTIONS = ["👋", "👍", "❤️", "😂", "🎉", "🤔", "👏", "🔥"];
type ScreenShareAudioMode = "tab" | "system" | "none";

// ── Screen Share Options Dialog ──────────────────────────────
function ScreenShareDialog({
  onSelect,
  onCancel,
}: {
  onSelect: (mode: ScreenShareAudioMode) => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[var(--voon-bg-elevated)] border border-white/10 rounded-2xl p-5 shadow-2xl animate-slide-up">
        <div className="flex items-center gap-2 mb-1">
          <MonitorPlay className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold text-sm">Pilih Sumber Audio</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">Pilih apakah suara ikut dibagikan saat berbagi layar</p>

        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => onSelect("tab")}
            className="flex items-start gap-3 w-full px-4 py-3 rounded-xl bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-left transition-colors">
            <Monitor className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Layar + Audio Tab</p>
              <p className="text-xs text-gray-500">Suara dari tab/jendela yang dipilih</p>
            </div>
          </button>
          <button type="button" onClick={() => onSelect("system")}
            className="flex items-start gap-3 w-full px-4 py-3 rounded-xl bg-[var(--voon-bg-card)] border border-white/10 hover:border-white/20 text-left transition-colors">
            <Volume2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Layar + Audio Komputer</p>
              <p className="text-xs text-gray-500">Semua suara dari sistem</p>
            </div>
          </button>
          <button type="button" onClick={() => onSelect("none")}
            className="flex items-start gap-3 w-full px-4 py-3 rounded-xl bg-[var(--voon-bg-card)] border border-white/10 hover:border-white/20 text-left transition-colors">
            <VolumeX className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Hanya Layar (tanpa audio)</p>
              <p className="text-xs text-gray-500">Tidak ada suara yang dibagikan</p>
            </div>
          </button>
        </div>
        <button type="button" onClick={onCancel}
          className="mt-3 w-full py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          Batal
        </button>
      </div>
    </div>
  );
}

// ── Reusable Panel Button ─────────────────────────────────────
function PanelBtn({
  panelName, Icon, label, activePanel, onTogglePanel, colorClass, badge,
}: {
  panelName: PanelType; Icon: React.ElementType; label: string;
  activePanel: string | null; onTogglePanel: (p: PanelType | null) => void;
  colorClass?: string; badge?: number;
}) {
  const isActive = activePanel === panelName;
  return (
    <button type="button"
      onClick={() => onTogglePanel(isActive ? null : panelName)}
      title={label}
      className={cn(
        "relative flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl transition-colors flex-shrink-0",
        isActive ? (colorClass ?? "bg-blue-600 text-white") : "bg-white/10 text-white hover:bg-white/20"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] leading-tight hidden sm:block">{label}</span>
      {badge != null && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full bg-red-500 text-white flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

// ── Control Bar ───────────────────────────────────────────────
export function ControlBar({
  isHost, meetingId, onLeave, onTogglePanel, activePanel,
  captionsEnabled, onToggleCaptions, onOpenQuiz,
  annotating, onToggleAnnotation, isScreenSharing,
  micLocked = false, camLocked = false,
}: ControlBarProps) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [showReactions, setShowReactions] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showScreenShareDialog, setShowScreenShareDialog] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [pushToTalk, setPushToTalk] = useState(false);
  const pttActive = useRef(false);
  const { isRecording, loading: recLoading, startRecording, stopRecording } = useRecording(meetingId);
  const moreRef = useRef<HTMLDivElement>(null);

  const isMuted = !localParticipant?.isMicrophoneEnabled;
  const isCamOff = !localParticipant?.isCameraEnabled;

  const toggleMic = useCallback(() => {
    if (micLocked && !isHost) return;
    localParticipant?.setMicrophoneEnabled(isMuted);
  }, [localParticipant, isMuted, micLocked, isHost]);

  const toggleCam = useCallback(() => {
    if (camLocked && !isHost) return;
    localParticipant?.setCameraEnabled(isCamOff);
  }, [localParticipant, isCamOff, camLocked, isHost]);

  // Push-to-talk: spacebar hold
  useEffect(() => {
    if (!pushToTalk) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !pttActive.current && e.target === document.body) {
        pttActive.current = true;
        localParticipant?.setMicrophoneEnabled(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && pttActive.current) {
        pttActive.current = false;
        localParticipant?.setMicrophoneEnabled(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [pushToTalk, localParticipant]);

  const handleScreenShareClick = useCallback(() => {
    if (sharing) {
      localParticipant?.setScreenShareEnabled(false).catch(() => {});
      setSharing(false);
    } else {
      setShowScreenShareDialog(true);
    }
  }, [sharing, localParticipant]);

  const startScreenShare = useCallback(async (audioMode: ScreenShareAudioMode) => {
    setShowScreenShareDialog(false);
    const opts: ScreenShareCaptureOptions = {
      audio: audioMode !== "none",
      selfBrowserSurface: "include",
      surfaceSwitching: "include",
      systemAudio: audioMode === "system" ? "include" : "exclude",
    };
    try {
      await localParticipant?.setScreenShareEnabled(true, opts);
      setSharing(true);
    } catch {
      setSharing(false);
    }
  }, [localParticipant]);

  const sendReaction = useCallback((emoji: string) => {
    room.localParticipant?.publishData(new TextEncoder().encode(JSON.stringify({ type: "reaction", emoji })));
    setShowReactions(false);
  }, [room]);

  const raiseHand = useCallback(() => {
    room.localParticipant?.publishData(new TextEncoder().encode(JSON.stringify({ type: "raise-hand" })));
  }, [room]);

  // Host: mute all mics
  const muteAll = useCallback(() => {
    room.localParticipant?.publishData(
      new TextEncoder().encode(JSON.stringify({ type: "mute-all" })),
      { reliable: true }
    );
  }, [room]);

  // Host: disable all cameras
  const disableAllCameras = useCallback(() => {
    room.localParticipant?.publishData(
      new TextEncoder().encode(JSON.stringify({ type: "disable-cameras-all" })),
      { reliable: true }
    );
  }, [room]);

  // PiP
  const togglePiP = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        const videos = document.querySelectorAll<HTMLVideoElement>("video");
        const target = Array.from(videos).find(v => !v.muted && v.srcObject) ?? videos[0];
        if (target) await target.requestPictureInPicture();
      }
    } catch { /* PiP not supported */ }
  }, []);

  const pipSupported = typeof document !== "undefined" && "pictureInPictureEnabled" in document;

  // Close more menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMore(false);
    };
    if (showMore) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMore]);

  // Close reactions on outside click
  useEffect(() => {
    const handler = () => setShowReactions(false);
    if (showReactions) setTimeout(() => document.addEventListener("click", handler), 0);
    return () => document.removeEventListener("click", handler);
  }, [showReactions]);

  return (
    <>
      {showScreenShareDialog && (
        <ScreenShareDialog onSelect={startScreenShare} onCancel={() => setShowScreenShareDialog(false)} />
      )}

      <div className="relative flex items-center gap-1.5 px-2 py-2 bg-[var(--voon-bg-card)]/95 border-t border-white/5 overflow-x-auto no-scrollbar flex-shrink-0">

        {/* Reactions popup */}
        {showReactions && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex gap-1.5 p-2.5 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-2xl z-50 shadow-xl">
            {REACTIONS.map((emoji) => (
              <button type="button" key={emoji} onClick={() => sendReaction(emoji)}
                className="text-xl hover:scale-125 transition-transform w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* ── Mic ── */}
        <button type="button" onClick={toggleMic}
          title={micLocked && !isHost ? "Mic dikunci oleh host" : (isMuted ? "Aktifkan Mic" : "Matikan Mic")}
          className={cn(
            "flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl transition-colors flex-shrink-0",
            isMuted ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/10 text-white hover:bg-white/20",
            micLocked && !isHost && "opacity-50 cursor-not-allowed"
          )}>
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          <span className="text-[10px] leading-tight hidden sm:block">{isMuted ? "Mic Off" : "Mic"}</span>
        </button>

        {/* ── Camera ── */}
        <button type="button" onClick={toggleCam}
          title={camLocked && !isHost ? "Kamera dikunci oleh host" : (isCamOff ? "Aktifkan Kamera" : "Matikan Kamera")}
          className={cn(
            "flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl transition-colors flex-shrink-0",
            isCamOff ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/10 text-white hover:bg-white/20",
            camLocked && !isHost && "opacity-50 cursor-not-allowed"
          )}>
          {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          <span className="text-[10px] leading-tight hidden sm:block">{isCamOff ? "Cam Off" : "Kamera"}</span>
        </button>

        {/* ── Screen Share ── */}
        <button type="button" onClick={handleScreenShareClick} title={sharing ? "Hentikan Berbagi" : "Berbagi Layar"}
          className={cn(
            "flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl transition-colors flex-shrink-0",
            sharing ? "bg-blue-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
          )}>
          {sharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          <span className="text-[10px] leading-tight hidden sm:block">Layar</span>
        </button>

        {/* ── Annotation (only when sharing) ── */}
        {isScreenSharing && (
          <button type="button" onClick={onToggleAnnotation} title={annotating ? "Matikan Anotasi" : "Aktifkan Anotasi"}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl transition-colors flex-shrink-0",
              annotating ? "bg-yellow-500 text-black" : "bg-white/10 text-white hover:bg-white/20"
            )}>
            {annotating ? <PencilOff className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
            <span className="text-[10px] leading-tight hidden sm:block">Coret</span>
          </button>
        )}

        {/* ── Noise cancellation ── */}
        <NoiseToggle className="flex-shrink-0" />

        {/* ── Push to Talk toggle ── */}
        <button type="button" onClick={() => setPushToTalk((p) => !p)}
          title={pushToTalk ? "Matikan Push-to-Talk (Spasi)" : "Aktifkan Push-to-Talk"}
          className={cn(
            "flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl transition-colors flex-shrink-0 relative",
            pushToTalk ? "bg-green-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
          )}>
          <Mic className="w-5 h-5" />
          <span className="text-[10px] leading-tight hidden sm:block">PTT</span>
          {pushToTalk && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border border-black/20" />
          )}
        </button>

        {/* ── Reactions ── */}
        <button type="button" onClick={() => setShowReactions((p) => !p)}
          className="flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors flex-shrink-0">
          <Smile className="w-5 h-5" />
          <span className="text-[10px] leading-tight hidden sm:block">Reaksi</span>
        </button>

        {/* ── Raise Hand ── */}
        <button type="button" onClick={raiseHand}
          className="flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors flex-shrink-0">
          <Hand className="w-5 h-5" />
          <span className="text-[10px] leading-tight hidden sm:block">Tangan</span>
        </button>

        <div className="w-px h-7 bg-white/10 flex-shrink-0 mx-0.5" />

        {/* ── Panel buttons ── */}
        <PanelBtn panelName="chat"         Icon={MessageSquare} label="Chat"    activePanel={activePanel} onTogglePanel={onTogglePanel} />
        <PanelBtn panelName="participants" Icon={Users}         label="Peserta" activePanel={activePanel} onTogglePanel={onTogglePanel} />
        <PanelBtn panelName="polls"        Icon={BarChart2}     label="Polling" activePanel={activePanel} onTogglePanel={onTogglePanel} />
        <PanelBtn panelName="qa"           Icon={HelpCircle}    label="Q&A"     activePanel={activePanel} onTogglePanel={onTogglePanel} />

        <div className="w-px h-7 bg-white/10 flex-shrink-0 mx-0.5" />

        <PanelBtn panelName="invite"   Icon={Link2}    label="Undang" activePanel={activePanel} onTogglePanel={onTogglePanel} colorClass="bg-green-600 text-white" />
        <PanelBtn panelName="bg"       Icon={ImageIcon} label="Latar"  activePanel={activePanel} onTogglePanel={onTogglePanel} colorClass="bg-teal-600 text-white" />
        <PanelBtn panelName="settings" Icon={Settings}  label="Setelan" activePanel={activePanel} onTogglePanel={onTogglePanel} />
        <PanelBtn panelName="music"    Icon={Music}    label="Musik"  activePanel={activePanel} onTogglePanel={onTogglePanel} colorClass="bg-purple-600 text-white" />

        {/* ── Captions ── */}
        <button type="button" onClick={onToggleCaptions}
          className={cn(
            "flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl transition-colors flex-shrink-0",
            captionsEnabled ? "bg-blue-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
          )}>
          <Subtitles className="w-5 h-5" />
          <span className="text-[10px] leading-tight hidden sm:block">Caption</span>
        </button>

        {/* ── PiP ── */}
        {pipSupported && (
          <button type="button" onClick={togglePiP} title="Picture-in-Picture"
            className="flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors flex-shrink-0">
            <PictureInPicture2 className="w-5 h-5" />
            <span className="text-[10px] leading-tight hidden sm:block">PiP</span>
          </button>
        )}

        {/* ── Host "More" menu ── */}
        {isHost && (
          <div ref={moreRef} className="relative flex-shrink-0">
            <button type="button" onClick={() => setShowMore((p) => !p)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl transition-colors",
                showMore ? "bg-white/20 text-white" : "bg-white/10 text-white hover:bg-white/20"
              )}>
              <ChevronUp className={cn("w-5 h-5 transition-transform", showMore && "rotate-180")} />
              <span className="text-[10px] leading-tight hidden sm:block">Host</span>
            </button>

            {showMore && (
              <div className="absolute bottom-full mb-2 right-0 w-56 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-2xl p-2 z-50 shadow-xl">
                {/* Recording */}
                <button type="button"
                  onClick={() => { isRecording ? stopRecording() : startRecording(); setShowMore(false); }}
                  disabled={recLoading}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-left",
                    isRecording ? "bg-red-600/20 text-red-400 hover:bg-red-600/30" : "text-white hover:bg-white/10"
                  )}>
                  {isRecording ? <StopCircle className="w-4 h-4 flex-shrink-0" /> : <Circle className="w-4 h-4 flex-shrink-0" />}
                  <span className="text-sm">{isRecording ? "Stop Rekaman" : "Mulai Rekaman"}</span>
                </button>

                {/* AI Quiz */}
                <button type="button" onClick={() => { onOpenQuiz(); setShowMore(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-purple-400 hover:bg-purple-600/20 transition-colors text-left">
                  <Brain className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">AI Quiz</span>
                </button>

                <div className="h-px bg-white/5 my-1" />

                {/* Mute all mics */}
                <button type="button" onClick={() => { muteAll(); setShowMore(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-orange-400 hover:bg-orange-600/20 transition-colors text-left">
                  <MicOff className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Bisukan Semua Mic</span>
                </button>

                {/* Disable all cameras */}
                <button type="button" onClick={() => { disableAllCameras(); setShowMore(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-orange-400 hover:bg-orange-600/20 transition-colors text-left">
                  <VideoOff className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Matikan Semua Kamera</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="w-px h-7 bg-white/10 flex-shrink-0 mx-0.5" />

        {/* ── Leave ── */}
        <button type="button" onClick={onLeave}
          className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors flex-shrink-0">
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] leading-tight hidden sm:block">Keluar</span>
        </button>
      </div>
    </>
  );
}
