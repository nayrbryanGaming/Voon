import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

export function getLiveKitClient() {
  return new RoomServiceClient(
    process.env.NEXT_PUBLIC_LIVEKIT_URL!.replace("wss://", "https://"),
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
