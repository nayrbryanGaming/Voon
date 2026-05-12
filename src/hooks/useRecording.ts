"use client";

import { useState, useCallback } from "react";
import { useRoomContext } from "@livekit/components-react";
import { toast } from "sonner";
import { useMeetingStore } from "@/store/useMeetingStore";

export function useRecording(meetingId: string) {
  const room = useRoomContext();
  const [loading, setLoading] = useState(false);
  const { isRecording, setRecording } = useMeetingStore();

  const startRecording = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recordings/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: room.name, meetingId }),
      });
      if (!res.ok) throw new Error("Failed to start recording");
      setRecording(true);
      toast.success("Rekaman dimulai");
    } catch {
      toast.error("Gagal memulai rekaman");
    } finally {
      setLoading(false);
    }
  }, [room.name, meetingId, setRecording]);

  const stopRecording = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recordings/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: room.name, meetingId }),
      });
      if (!res.ok) throw new Error("Failed to stop recording");
      setRecording(false);
      toast.success("Rekaman disimpan");
    } catch {
      toast.error("Gagal menghentikan rekaman");
    } finally {
      setLoading(false);
    }
  }, [room.name, meetingId, setRecording]);

  return { isRecording, loading, startRecording, stopRecording };
}
