"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { Minimize2, Maximize2, X } from "lucide-react";

interface Pos { x: number; y: number }

export function FloatingMiniVideo() {
  const { localParticipant, cameraTrack } = useLocalParticipant();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [pos, setPos] = useState<Pos>({ x: 16, y: 80 });
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  // Attach local camera track to video element
  useEffect(() => {
    if (!cameraTrack?.track || !videoRef.current) return;
    cameraTrack.track.attach(videoRef.current);
    return () => { cameraTrack.track?.detach(videoRef.current!); };
  }, [cameraTrack]);

  // Drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = containerRef.current?.offsetWidth ?? 128;
    const h = containerRef.current?.offsetHeight ?? 96;
    setPos({
      x: Math.max(0, Math.min(vw - w, dragState.current.origX + dx)),
      y: Math.max(0, Math.min(vh - h, dragState.current.origY + dy)),
    });
  };
  const onPointerUp = () => { dragState.current = null; };

  if (dismissed || !localParticipant?.isCameraEnabled) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 touch-none select-none"
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className={`relative rounded-2xl overflow-hidden border-2 border-blue-500/60 shadow-2xl bg-black transition-all ${minimized ? "w-14 h-14" : "w-32 h-24"}`}>
        {!minimized && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
        )}
        {minimized && (
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-blue-900">
            Saya
          </div>
        )}

        {/* Controls overlay */}
        <div className="absolute top-1 right-1 flex gap-1">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setMinimized((p) => !p)}
            className="w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
          >
            {minimized ? <Maximize2 className="w-2.5 h-2.5" /> : <Minimize2 className="w-2.5 h-2.5" />}
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setDismissed(true)}
            className="w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-600/80"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
