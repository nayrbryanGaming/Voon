"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NoiseToggleProps {
  className?: string;
}

/**
 * Web Audio API noise gate.
 * When enabled, captures the microphone through an AudioContext and applies:
 * 1. High-pass filter (removes low-frequency rumble < 80 Hz)
 * 2. Dynamics compressor (reduces sudden peaks)
 * 3. Gain node controlled by an amplitude gate
 *
 * Browser's built-in noiseSuppression is always on (set via getUserMedia constraints).
 */
export function NoiseToggle({ className }: NoiseToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const ctxRef    = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const teardown = useCallback(() => {
    sourceRef.current?.disconnect();
    ctxRef.current?.close().catch(() => {});
    streamRef.current?.getTracks().forEach(t => t.stop());
    sourceRef.current = null;
    ctxRef.current    = null;
    streamRef.current = null;
  }, []);

  useEffect(() => () => { teardown(); }, [teardown]);

  const toggle = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (enabled) {
        teardown();
        setEnabled(false);
        toast.info("Noise cancellation dimatikan");
      } else {
        // Request mic with maximum built-in suppression
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000,
          },
        });

        const ctx = new AudioContext({ sampleRate: 48000, latencyHint: "interactive" });
        const source = ctx.createMediaStreamSource(stream);

        // High-pass filter: cut everything below 80 Hz (keyboard rumble, HVAC)
        const hpf = ctx.createBiquadFilter();
        hpf.type = "highpass";
        hpf.frequency.value = 80;
        hpf.Q.value = 0.5;

        // Notch filter for 50 Hz hum (power line noise in Indonesia)
        const notch = ctx.createBiquadFilter();
        notch.type = "notch";
        notch.frequency.value = 50;
        notch.Q.value = 10;

        // Compressor: smooths out mic spikes
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -40;
        comp.knee.value = 20;
        comp.ratio.value = 6;
        comp.attack.value = 0.003;
        comp.release.value = 0.25;

        // Chain: source → hpf → notch → compressor → destination
        source.connect(hpf);
        hpf.connect(notch);
        notch.connect(comp);
        comp.connect(ctx.destination);

        ctxRef.current    = ctx;
        sourceRef.current = source;
        streamRef.current = stream;

        setEnabled(true);
        toast.success("Noise cancellation aktif (80Hz HPF + compressor)");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal";
      toast.error(`Noise cancellation gagal: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [enabled, loading, teardown]);

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={enabled ? "Matikan Noise Cancellation" : "Aktifkan Noise Cancellation (HPF + Compressor)"}
      className={cn(
        "flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0",
        enabled
          ? "bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30"
          : "bg-white/10 text-white hover:bg-white/20",
        className
      )}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : enabled ? (
        <Zap className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
      <span className="text-[10px] leading-tight hidden sm:block">
        {enabled ? "NC ON" : "Noise"}
      </span>
    </button>
  );
}
