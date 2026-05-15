"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Music2, Volume2, VolumeX, SkipForward } from "lucide-react";

interface Playlist {
  id: string;
  title: string;
  videoId: string;
  emoji: string;
}

const PLAYLISTS: Playlist[] = [
  { id: "lofi-girl",    title: "Lofi Girl – Study Beats",      videoId: "jfKfPfyJRdk", emoji: "🎵" },
  { id: "chillhop",    title: "Chillhop Radio",                videoId: "7NOSDKb0HlU", emoji: "☕" },
  { id: "jazz",        title: "Jazz Cafe – Smooth Jazz",       videoId: "neV3EPgvZ3g", emoji: "🎷" },
  { id: "nature",      title: "Nature – Rain & Forest",        videoId: "q76bMs-NwRk", emoji: "🌧️" },
  { id: "deep-focus",  title: "Deep Focus – Work Music",       videoId: "ySFZuEpajJ8", emoji: "🧠" },
  { id: "classical",   title: "Classical – Piano Relaxing",    videoId: "H3v9unphfi0", emoji: "🎹" },
];

function sendYTCommand(iframe: HTMLIFrameElement | null, func: string, args: unknown[] = []) {
  if (!iframe?.contentWindow) return;
  iframe.contentWindow.postMessage(
    JSON.stringify({ event: "command", func, args }),
    "*"
  );
}

export function MusicPlayer() {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [muted, setMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevVolumeRef = useRef(50);

  // Apply volume to YouTube player whenever volume/muted changes
  useEffect(() => {
    if (!iframeRef.current || !playing) return;
    if (muted) {
      sendYTCommand(iframeRef.current, "mute");
    } else {
      sendYTCommand(iframeRef.current, "unMute");
      sendYTCommand(iframeRef.current, "setVolume", [volume]);
    }
  }, [volume, muted, playing]);

  // When iframe loads, set initial volume
  const onIframeLoad = useCallback(() => {
    if (!iframeRef.current) return;
    // Small delay so the player JS is ready
    setTimeout(() => {
      sendYTCommand(iframeRef.current, "setVolume", [volume]);
      if (muted) sendYTCommand(iframeRef.current, "mute");
    }, 800);
  }, [volume, muted]);

  const selectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setPlaying(true);
  };

  const togglePlay = () => {
    if (!iframeRef.current) return;
    if (playing) {
      sendYTCommand(iframeRef.current, "pauseVideo");
    } else {
      sendYTCommand(iframeRef.current, "playVideo");
    }
    setPlaying((p) => !p);
  };

  const toggleMute = () => {
    setMuted((m) => {
      if (!m) prevVolumeRef.current = volume;
      return !m;
    });
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (val > 0 && muted) setMuted(false);
    sendYTCommand(iframeRef.current, "setVolume", [val]);
  };

  const skipNext = () => {
    if (!selectedPlaylist) return;
    const idx = PLAYLISTS.findIndex(p => p.id === selectedPlaylist.id);
    const next = PLAYLISTS[(idx + 1) % PLAYLISTS.length];
    setSelectedPlaylist(next);
    setPlaying(true);
  };

  const embedUrl = selectedPlaylist
    ? `https://www.youtube.com/embed/${selectedPlaylist.videoId}?autoplay=1&mute=0&loop=1&playlist=${selectedPlaylist.videoId}&controls=0&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "https://voon.vercel.app")}`
    : null;

  return (
    <div className="flex flex-col gap-4 p-4 bg-[var(--voon-bg-elevated)] min-h-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Music2 className="w-4 h-4 text-purple-400" />
        <h3 className="font-semibold text-white text-sm">Music Player</h3>
      </div>

      {/* Now playing */}
      {selectedPlaylist ? (
        <div className="rounded-xl border border-purple-500/20 bg-purple-600/10 p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Sekarang Diputar</p>
              <p className="text-sm font-medium text-white truncate">
                {selectedPlaylist.emoji} {selectedPlaylist.title}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white transition-colors"
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={skipNext}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                title="Lagu berikutnya"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleMute} className="text-gray-400 hover:text-white flex-shrink-0">
              {muted || volume === 0
                ? <VolumeX className="w-3.5 h-3.5" />
                : <Volume2 className="w-3.5 h-3.5" />
              }
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              aria-label="Volume musik"
              title="Volume musik"
              className="flex-1 h-1.5 rounded-full accent-purple-500 cursor-pointer"
            />
            <span className="text-xs text-gray-500 w-8 text-right">{muted ? "0" : volume}%</span>
          </div>

          {/* Sound bars animation when playing */}
          {playing && (
            <div className="flex items-end gap-0.5 h-5 justify-center">
              <span className="w-1.5 bg-purple-400 rounded-sm music-bar-1" />
              <span className="w-1.5 bg-purple-400 rounded-sm music-bar-2" />
              <span className="w-1.5 bg-purple-400 rounded-sm music-bar-3" />
              <span className="w-1.5 bg-purple-400 rounded-sm music-bar-4" />
              <span className="w-1.5 bg-purple-400 rounded-sm music-bar-5" />
              <span className="w-1.5 bg-purple-400 rounded-sm music-bar-6" />
              <span className="w-1.5 bg-purple-400 rounded-sm music-bar-7" />
            </div>
          )}

          {/* Hidden YouTube iframe (audio only, no visible UI) */}
          {embedUrl && (
            <iframe
              ref={iframeRef}
              key={selectedPlaylist.videoId}
              src={embedUrl}
              title={selectedPlaylist.title}
              allow="autoplay; encrypted-media"
              className="w-0 h-0 opacity-0 absolute pointer-events-none"
              style={{ border: "none" }}
              onLoad={onIframeLoad}
            />
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-[var(--voon-bg-card)] p-4 text-center">
          <Music2 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Pilih playlist untuk mulai</p>
        </div>
      )}

      {/* Playlist selection */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Pilih Playlist</p>
        <div className="flex flex-col gap-1.5">
          {PLAYLISTS.map((playlist) => {
            const isActive = selectedPlaylist?.id === playlist.id;
            return (
              <button
                key={playlist.id}
                type="button"
                onClick={() => selectPlaylist(playlist)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border transition-colors text-left ${
                  isActive
                    ? "border-purple-500/40 bg-purple-600/15 text-white"
                    : "border-white/10 bg-[var(--voon-bg-card)] text-gray-300 hover:border-purple-500/20 hover:bg-purple-600/10"
                }`}
              >
                <span className="text-lg flex-shrink-0">{playlist.emoji}</span>
                <span className="text-sm font-medium truncate">{playlist.title}</span>
                {isActive && playing && (
                  <span className="ml-auto flex gap-0.5 items-end h-4 flex-shrink-0">
                    <span className="w-1 bg-purple-400 rounded-sm music-bar-sm-1" />
                    <span className="w-1 bg-purple-400 rounded-sm music-bar-sm-2" />
                    <span className="w-1 bg-purple-400 rounded-sm music-bar-sm-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-gray-600 text-center leading-relaxed">
        Musik hanya didengar oleh Anda sendiri, tidak disiarkan ke peserta lain.
      </p>
    </div>
  );
}
