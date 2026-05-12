"use client";

import { useEffect, useCallback } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

export function useAttendance(meetingId: string) {
  const room = useRoomContext();

  // Attendance is auto-tracked server-side via LiveKit webhooks.
  // This hook provides client-side signals only.

  const recordJoin = useCallback(async () => {
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId, action: "join" }),
    }).catch(() => {});
  }, [meetingId]);

  useEffect(() => {
    if (!meetingId) return;
    // The webhook handles server-side tracking, this is a fallback
    recordJoin();
  }, [meetingId, recordJoin]);
}
