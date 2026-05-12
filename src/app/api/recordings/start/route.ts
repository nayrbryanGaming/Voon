import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { EgressClient, EncodedFileOutput, S3Upload } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { roomName, meetingId } = await req.json();
  if (!roomName || typeof roomName !== "string") {
    return NextResponse.json({ error: "roomName required" }, { status: 400 });
  }
  if (!meetingId || typeof meetingId !== "string") {
    return NextResponse.json({ error: "meetingId required" }, { status: 400 });
  }

  // Only host of the meeting can start recording
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  if (meeting.hostId !== user.id) return NextResponse.json({ error: "Forbidden — only host can record" }, { status: 403 });

  // Validate required env vars
  const livekitUrl = process.env.LIVEKIT_URL;
  const livekitKey = process.env.LIVEKIT_API_KEY;
  const livekitSecret = process.env.LIVEKIT_API_SECRET;
  if (!livekitUrl || !livekitKey || !livekitSecret) {
    console.error("Missing LiveKit env vars for recording");
    return NextResponse.json({ error: "Recording not configured" }, { status: 503 });
  }

  try {
    const egressClient = new EgressClient(livekitUrl, livekitKey, livekitSecret);

    const s3Bucket = process.env.S3_BUCKET ?? "voon-recordings";
    const s3Region = process.env.S3_REGION ?? "ap-southeast-1";
    const s3Key = process.env.S3_ACCESS_KEY;
    const s3Secret = process.env.S3_SECRET_KEY;

    const s3 = new S3Upload({
      bucket: s3Bucket,
      region: s3Region,
      ...(s3Key && s3Secret ? { accessKey: s3Key, secret: s3Secret } : {}),
    });

    const output = new EncodedFileOutput({
      filepath: `recordings/${meetingId}/{room_name}-{time}.mp4`,
      output: { case: "s3", value: s3 },
    });

    const egress = await egressClient.startRoomCompositeEgress(roomName, { file: output });

    return NextResponse.json({ egressId: egress.egressId, status: "started" });
  } catch (err) {
    console.error("Recording start error:", err);
    return NextResponse.json({ error: "Failed to start recording" }, { status: 500 });
  }
}
