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
  return new RoomServiceClient(
    getLiveKitHttpUrl(),
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!
  );
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
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: participantId,
      name: participantName,
      ttl: "4h",
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
