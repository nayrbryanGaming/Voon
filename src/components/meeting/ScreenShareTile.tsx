"use client";

import { useEffect, useRef } from "react";
import { Track } from "livekit-client";
import { useTracks } from "@livekit/components-react";

export function ScreenShareTile() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const tracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }], {
    onlySubscribed: true,
  });

  const screenTrack = tracks[0];

  useEffect(() => {
    if (!screenTrack?.publication?.track || !videoRef.current) return;
    screenTrack.publication.track.attach(videoRef.current);
    return () => {
      screenTrack.publication?.track?.detach();
    };
  }, [screenTrack]);

  if (!screenTrack) return null;

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain"
      />
      <div className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
        {screenTrack.participant?.name ?? "Layar dibagikan"}
      </div>
    </div>
  );
}
