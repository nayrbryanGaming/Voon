import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

/**
 * Returns the LiveKit HTTP URL for server-side SDK usage.
 * Falls back to deriving from the public WSS URL if LIVEKIT_URL is not set.
 */
export function getLiveKitHttpUrl(): string {
  const explicit = process.env.LIVEKIT_URL;
  if (explicit) return explicit;
  const wss = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";
  return wss.replace(/^wss?:\/\//, "https://");
}

export function getLiveKitClient() {
  const key = process.env.LIVEKIT_API_KEY;
  const secret = process.env.LIVEKIT_API_SECRET;
  if (!key || !secret) throw new Error("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set");
  return new RoomServiceClient(getLiveKitHttpUrl(), key, secret);
}

export async function generateToken({
  roomName,
  participantName,
  participantId,
  isHost = false,
}: {
  roomName: string;
  participantName: string;
  participantId: string;
  isHost?: boolean;
}) {
  const key = process.env.LIVEKIT_API_KEY;
  const secret = process.env.LIVEKIT_API_SECRET;
  if (!key || !secret) throw new Error("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set");
  const at = new AccessToken(
    key,
    secret,
    {
      identity: participantId,
      name: participantName,
      ttl: "24h",
    }
  );

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: isHost,
    roomRecord: isHost,
  });

  return at.toJwt();
}
