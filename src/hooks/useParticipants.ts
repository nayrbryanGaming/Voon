"use client";

import { useParticipants as useLKParticipants, useLocalParticipant } from "@livekit/components-react";

export function useParticipants() {
  const participants = useLKParticipants();
  const { localParticipant } = useLocalParticipant();

  const count = participants.length;
  const remoteParticipants = participants.filter(
    (p) => p.identity !== localParticipant?.identity
  );

  return {
    participants,
    localParticipant,
    remoteParticipants,
    count,
  };
}
