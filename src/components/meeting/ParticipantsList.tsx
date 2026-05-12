"use client";

import { useParticipants, useLocalParticipant } from "@livekit/components-react";
import { Mic, MicOff, Video, VideoOff, Crown } from "lucide-react";
import { getInitials } from "@/lib/utils";

export function ParticipantsList({ isHost }: { isHost: boolean }) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-white font-semibold text-sm">Peserta ({participants.length})</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {participants.map((p) => {
          const isLocal = p.identity === localParticipant?.identity;
          return (
            <div key={p.identity} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-blue-400">
                  {getInitials(p.name ?? p.identity)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  {p.name ?? p.identity}
                  {isLocal && <span className="text-gray-500 ml-1">(Anda)</span>}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {p.isMicrophoneEnabled ? (
                  <Mic className="w-3.5 h-3.5 text-gray-500" />
                ) : (
                  <MicOff className="w-3.5 h-3.5 text-red-400" />
                )}
                {p.isCameraEnabled ? (
                  <Video className="w-3.5 h-3.5 text-gray-500" />
                ) : (
                  <VideoOff className="w-3.5 h-3.5 text-red-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
