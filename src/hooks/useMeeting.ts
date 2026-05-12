"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Meeting } from "@/types/meeting";

export function useMeeting(meetingId?: string) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMeeting = useCallback(async () => {
    if (!meetingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}`);
      if (!res.ok) throw new Error("Failed to fetch meeting");
      const data = await res.json();
      setMeeting(data);
    } catch {
      toast.error("Gagal memuat data meeting");
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  const updateMeeting = useCallback(async (updates: Partial<Meeting>) => {
    if (!meetingId) return;
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update meeting");
      const data = await res.json();
      setMeeting(data);
      return data;
    } catch {
      toast.error("Gagal mengupdate meeting");
    }
  }, [meetingId]);

  return { meeting, loading, fetchMeeting, updateMeeting };
}
