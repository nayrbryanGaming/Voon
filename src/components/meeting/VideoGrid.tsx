"use client";

import { memo, useMemo, useState, useEffect, useCallback } from "react";
import {
  useTracks,
  ParticipantTile,
  useIsSpeaking,
  useSpeakingParticipants,
  useLocalParticipant,
  type TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import {
  LayoutGrid, User, Monitor, Zap, ZapOff,
  ChevronLeft, ChevronRight, UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "gallery" | "speaker" | "presentation";
const PAGE_SIZE = 9;

interface VideoGridProps {
  annotating?: boolean;
  onScreenShareChange?: (sharing: boolean) => void;
  raisedHands?: string[];
}

/* ─── Single tile ─────────────────────────────────────────── */
const VideoTile = memo(function VideoTile({
  track,
  big = false,
  className,
  hasRaisedHand = false,
}: {
  track: TrackReferenceOrPlaceholder;
  big?: boolean;
  className?: string;
  hasRaisedHand?: boolean;
}) {
  const isSpeaking = useIsSpeaking(track.participant);
  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden relative voon-video-tile w-full h-full",
        isSpeaking && "ring-2 ring-blue-500 ring-offset-1 ring-offset-[var(--voon-bg)]",
        big && "rounded-none",
        className
      )}
    >
      <ParticipantTile trackRef={track} className="w-full h-full" />
      {hasRaisedHand && (
        <div className="absolute top-2 right-2 text-xl bg-black/50 rounded-full w-7 h-7 flex items-center justify-center pointer-events-none z-10">
          ✋
        </div>
      )}
    </div>
  );
});

/* ─── Strip thumbnail ─────────────────────────────────────── */
const ThumbTile = memo(function ThumbTile({
  track,
  active = false,
  onClick,
}: {
  track: TrackReferenceOrPlaceholder;
  active?: boolean;
  onClick?: () => void;
}) {
  const isSpeaking = useIsSpeaking(track.participant);
  return (
    <button
      type="button"
      title={`Tampilkan ${track.participant.identity}`}
      onClick={onClick}
      className={cn(
        "w-36 h-24 flex-shrink-0 rounded-xl overflow-hidden voon-video-tile transition-all",
        active    && "ring-2 ring-blue-500",
        isSpeaking && !active && "ring-2 ring-green-400/70",
        "hover:scale-[1.03]"
      )}
    >
      <ParticipantTile trackRef={track} className="w-full h-full" />
    </button>
  );
});

/* ─── Empty state ─────────────────────────────────────────── */
function EmptyGrid() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <UserCircle2 className="w-12 h-12 text-gray-700 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">Menunggu peserta...</p>
      </div>
    </div>
  );
}

/* ─── Gallery layout ──────────────────────────────────────── */
function GalleryView({
  tracks,
  page,
  setPage,
  totalPages,
  raisedHands = [],
}: {
  tracks: TrackReferenceOrPlaceholder[];
  page: number;
  setPage: (p: number | ((prev: number) => number)) => void;
  totalPages: number;
  raisedHands?: string[];
}) {
  const n = tracks.length;

  // Only control columns — voon-video-grid CSS handles rows with grid-auto-rows:1fr
  const colsClass = useMemo(() => {
    if (n <= 1) return "grid-cols-1";
    if (n === 2) return "grid-cols-2";
    if (n === 3) return "grid-cols-3";
    if (n === 4) return "grid-cols-2";
    return "grid-cols-3";
  }, [n]);

  if (n === 0) return <EmptyGrid />;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* voon-video-grid applies grid-auto-rows:1fr so all rows fill equally */}
      <div className={cn("voon-video-grid", colsClass)}>
        {tracks.map((track) => (
          <VideoTile
            key={`${track.participant.identity}-${track.source}`}
            track={track}
            hasRaisedHand={raisedHands.includes(track.participant.identity)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-1.5 flex-shrink-0">
          <button
            type="button"
            title="Halaman sebelumnya"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 font-medium">{page + 1} / {totalPages}</span>
          <button
            type="button"
            title="Halaman berikutnya"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Speaker layout ──────────────────────────────────────── */
function SpeakerView({
  tracks,
  pinnedIdx,
  setPinnedIdx,
}: {
  tracks: TrackReferenceOrPlaceholder[];
  pinnedIdx: number;
  setPinnedIdx: (i: number) => void;
}) {
  const activeSpeakers = useSpeakingParticipants();
  const { localParticipant } = useLocalParticipant();

  // Determine main track: pinned → active speaker → local → first
  const mainIdx = useMemo(() => {
    if (tracks.length === 0) return 0;
    if (pinnedIdx >= 0 && pinnedIdx < tracks.length) return pinnedIdx;
    // Find first active speaker that has a camera track
    for (const sp of activeSpeakers) {
      const idx = tracks.findIndex((t) => t.participant.identity === sp.identity);
      if (idx >= 0) return idx;
    }
    // Fall back to local participant
    const localIdx = tracks.findIndex((t) => t.participant.identity === localParticipant?.identity);
    return localIdx >= 0 ? localIdx : 0;
  }, [tracks, pinnedIdx, activeSpeakers, localParticipant]);

  const mainTrack = tracks[mainIdx];
  const stripTracks = useMemo(() => tracks.filter((_, i) => i !== mainIdx), [tracks, mainIdx]);

  if (tracks.length === 0) return <EmptyGrid />;

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-1.5">
      {/* Main speaker — voon-speaker-main fills remaining height */}
      <div className="voon-speaker-main relative">
        {mainTrack && <ParticipantTile trackRef={mainTrack} className="w-full h-full" />}
        {pinnedIdx >= 0 && (
          <button
            type="button"
            onClick={() => setPinnedIdx(-1)}
            className="absolute top-2 right-2 text-[10px] bg-black/60 text-white px-2 py-1 rounded-full hover:bg-black/80 transition-colors z-10"
          >
            Lepas Pin
          </button>
        )}
        {/* Active speaker indicator */}
        {activeSpeakers.length > 0 && mainTrack && activeSpeakers[0]?.identity === mainTrack.participant.identity && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-green-600/80 text-white text-[10px] px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Berbicara
          </div>
        )}
      </div>

      {/* Strip */}
      {stripTracks.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto flex-shrink-0 no-scrollbar h-24 pb-0.5">
          {stripTracks.map((track) => {
            const realIdx = tracks.findIndex(
              (t) => t.participant.identity === track.participant.identity && t.source === track.source
            );
            return (
              <ThumbTile
                key={`${track.participant.identity}-${track.source}`}
                track={track}
                active={realIdx === mainIdx}
                onClick={() => setPinnedIdx(realIdx)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Presentation layout (screen share) ─────────────────── */
function PresentationView({
  screenTrack,
  cameraTrack,
  annotating,
  allCameras,
}: {
  screenTrack: TrackReferenceOrPlaceholder;
  cameraTrack: TrackReferenceOrPlaceholder | null;
  annotating: boolean;
  allCameras: TrackReferenceOrPlaceholder[];
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0 gap-1.5">
      {/* Full screen share */}
      <div className="flex-1 min-h-0 rounded-2xl overflow-hidden relative voon-video-tile">
        <ParticipantTile trackRef={screenTrack} className="w-full h-full" />
        {annotating && (
          <div className="absolute inset-0 bg-black/10 pointer-events-none rounded-2xl ring-2 ring-yellow-400" />
        )}
      </div>

      {/* Cameras strip */}
      {allCameras.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto flex-shrink-0 no-scrollbar h-24">
          {allCameras.map((track) => (
            <ThumbTile
              key={`${track.participant.identity}-cam`}
              track={track}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main VideoGrid ──────────────────────────────────────── */
export function VideoGrid({ annotating = false, onScreenShareChange, raisedHands = [] }: VideoGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [perfMode, setPerfMode] = useState(false);
  const [page, setPage] = useState(0);
  const [pinnedIdx, setPinnedIdx] = useState(-1); // -1 = auto

  const tracks = useTracks([
    { source: Track.Source.Camera,      withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const screenShareTrack = useMemo(
    () => tracks.find((t) => t.source === Track.Source.ScreenShare) ?? null,
    [tracks]
  );

  const cameraTracks = useMemo(
    () => tracks.filter((t) => t.source !== Track.Source.ScreenShare),
    [tracks]
  );

  // Notify parent
  useEffect(() => {
    onScreenShareChange?.(!!screenShareTrack);
  }, [screenShareTrack, onScreenShareChange]);

  // Auto-switch to presentation mode on screenshare start
  useEffect(() => {
    if (screenShareTrack) {
      setViewMode("presentation");
    } else if (viewMode === "presentation") {
      setViewMode("gallery");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!screenShareTrack]);

  const displayedTracks = useMemo(
    () => (perfMode ? cameraTracks.slice(0, 1) : cameraTracks),
    [perfMode, cameraTracks]
  );

  const totalPages = Math.max(1, Math.ceil(displayedTracks.length / PAGE_SIZE));

  const pagedTracks = useMemo(
    () => displayedTracks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [displayedTracks, page]
  );

  // Clamp page
  useEffect(() => {
    if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [totalPages, page]);

  const handleSetPage = useCallback((p: number | ((prev: number) => number)) => {
    setPage(p);
    setPinnedIdx(-1);
  }, []);

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-2">
      {/* Top controls */}
      <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
        {/* Participant count */}
        <span className="text-xs text-gray-600 pl-1">
          {cameraTracks.length} peserta
        </span>

        <div className="flex items-center gap-0.5">
          {/* Bandwidth saver */}
          <button
            type="button"
            onClick={() => setPerfMode((p) => !p)}
            title={perfMode ? "Mode normal" : "Hemat bandwidth"}
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs font-medium",
              perfMode
                ? "bg-green-600 text-white"
                : "text-gray-500 hover:text-white hover:bg-white/10"
            )}
          >
            {perfMode ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{perfMode ? "Hemat ON" : "Hemat"}</span>
          </button>

          <div className="w-px h-4 bg-white/10 mx-1" />

          {/* View mode toggles */}
          <button
            type="button"
            onClick={() => setViewMode("gallery")}
            title="Galeri"
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              viewMode === "gallery"
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:text-white hover:bg-white/10"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("speaker")}
            title="Tampilan Pembicara"
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              viewMode === "speaker"
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:text-white hover:bg-white/10"
            )}
          >
            <User className="w-4 h-4" />
          </button>
          {screenShareTrack && (
            <button
              type="button"
              onClick={() => setViewMode("presentation")}
              title="Mode Presentasi"
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                viewMode === "presentation"
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-white hover:bg-white/10"
              )}
            >
              <Monitor className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bandwidth warning */}
      {perfMode && (
        <div className="flex items-center gap-2 mb-1.5 px-3 py-1.5 rounded-lg bg-green-600/10 border border-green-500/20 text-xs text-green-400 flex-shrink-0">
          <Zap className="w-3 h-3 flex-shrink-0" />
          Mode hemat bandwidth aktif — 1 tile ditampilkan.
        </div>
      )}

      {/* Layout views */}
      {viewMode === "presentation" && screenShareTrack ? (
        <PresentationView
          screenTrack={screenShareTrack}
          cameraTrack={cameraTracks[0] ?? null}
          annotating={annotating}
          allCameras={perfMode ? cameraTracks.slice(0, 1) : cameraTracks}
        />
      ) : viewMode === "speaker" ? (
        <SpeakerView
          tracks={displayedTracks}
          pinnedIdx={pinnedIdx}
          setPinnedIdx={setPinnedIdx}
        />
      ) : (
        <GalleryView
          tracks={pagedTracks}
          page={page}
          setPage={handleSetPage}
          totalPages={totalPages}
          raisedHands={raisedHands}
        />
      )}
    </div>
  );
}
