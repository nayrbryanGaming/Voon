"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chapter {
  title: string;
  timestamp: number; // seconds
}

interface MeetingReplayProps {
  recordingUrl: string;
  title: string;
  chapters?: Chapter[];
}

export function MeetingReplay({ recordingUrl, title, chapters = [] }: MeetingReplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const seekTo = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    if (!playing) videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
  };

  const fullscreen = () => videoRef.current?.requestFullscreen?.();

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-black border border-white/10">
      {/* Video */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={recordingUrl}
          className="w-full h-full"
          onTimeUpdate={(e) => {
            const t = e.currentTarget.currentTime;
            setCurrentTime(t);
            setProgress(duration > 0 ? (t / duration) * 100 : 0);
          }}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setPlaying(false)}
          onClick={togglePlay}
        />
        {!playing && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Play className="w-7 h-7 text-white ml-1" />
            </div>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3 bg-[var(--voon-bg-card)]">
        <div className="flex items-center justify-between">
          <p className="text-white text-sm font-medium truncate">{title}</p>
          <a
            href={recordingUrl}
            download
            className="text-gray-500 hover:text-white transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>

        {/* Progress */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={seek}
          className="w-full h-1.5 accent-blue-500 cursor-pointer"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-xs text-gray-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <button onClick={fullscreen} className="text-gray-400 hover:text-white transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* AI Chapters */}
        {chapters.length > 0 && (
          <div className="border-t border-white/10 pt-3">
            <p className="text-xs text-gray-500 mb-2">Bab (AI-generated)</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {chapters.map((ch, i) => (
                <button
                  key={i}
                  onClick={() => seekTo(ch.timestamp)}
                  className={cn(
                    "w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    currentTime >= ch.timestamp && (i === chapters.length - 1 || currentTime < chapters[i + 1].timestamp)
                      ? "bg-blue-600/20 text-blue-400"
                      : "hover:bg-white/5 text-gray-400"
                  )}
                >
                  <span className="text-xs text-gray-600 w-10 flex-shrink-0">{formatTime(ch.timestamp)}</span>
                  <span className="truncate">{ch.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
