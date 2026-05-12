"use client";

import { useState } from "react";
import {
  useTracks,
  ParticipantTile,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { LayoutGrid, User } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "gallery" | "speaker";

export function VideoGrid() {
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);
  const { localParticipant } = useLocalParticipant();

  const screenShareTrack = tracks.find((t) => t.source === Track.Source.ScreenShare);
  const cameraAndPlaceholderTracks = tracks.filter((t) => t.source !== Track.Source.ScreenShare);

  if (screenShareTrack) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden p-2 gap-2">
        <div className="flex-1 rounded-2xl overflow-hidden relative">
          <ParticipantTile trackRef={screenShareTrack} className="w-full h-full" />
        </div>
        <div className="flex gap-2 overflow-x-auto h-24 flex-shrink-0">
          {cameraAndPlaceholderTracks.map((track) => (
            <div key={track.participant.identity} className="w-32 h-24 flex-shrink-0 rounded-xl overflow-hidden">
              <ParticipantTile trackRef={track} className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-2">
      {/* View toggle */}
      <div className="flex justify-end mb-2 gap-1">
        <button
          onClick={() => setViewMode("gallery")}
          className={cn("p-1.5 rounded-lg transition-colors", viewMode === "gallery" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-white hover:bg-white/10")}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode("speaker")}
          className={cn("p-1.5 rounded-lg transition-colors", viewMode === "speaker" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-white hover:bg-white/10")}
        >
          <User className="w-4 h-4" />
        </button>
      </div>

      {viewMode === "gallery" ? (
        <div
          className={cn(
            "flex-1 grid gap-2",
            cameraAndPlaceholderTracks.length === 1 && "grid-cols-1",
            cameraAndPlaceholderTracks.length === 2 && "grid-cols-2",
            cameraAndPlaceholderTracks.length <= 4 && cameraAndPlaceholderTracks.length > 2 && "grid-cols-2",
            cameraAndPlaceholderTracks.length > 4 && "grid-cols-3"
          )}
        >
          {cameraAndPlaceholderTracks.map((track) => (
            <div key={track.participant.identity} className="rounded-2xl overflow-hidden relative">
              <ParticipantTile trackRef={track} className="w-full h-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2">
          {/* Active speaker large */}
          {cameraAndPlaceholderTracks[0] && (
            <div className="flex-1 rounded-2xl overflow-hidden">
              <ParticipantTile trackRef={cameraAndPlaceholderTracks[0]} className="w-full h-full" />
            </div>
          )}
          {/* Others strip */}
          {cameraAndPlaceholderTracks.length > 1 && (
            <div className="flex gap-2 overflow-x-auto h-28 flex-shrink-0">
              {cameraAndPlaceholderTracks.slice(1).map((track) => (
                <div key={track.participant.identity} className="w-36 h-28 flex-shrink-0 rounded-xl overflow-hidden">
                  <ParticipantTile trackRef={track} className="w-full h-full" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
