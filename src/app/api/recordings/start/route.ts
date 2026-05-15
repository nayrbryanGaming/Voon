import { NextRequest, NextResponse } from "next/server";
import { getServerUserId } from "@/lib/session";
import { EgressClient, EncodedFileOutput, S3Upload } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { getLiveKitHttpUrl } from "@/lib/livekit";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const MAX_RECORDINGS_PER_ACCOUNT = 5;

export async function POST(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const { roomName, meetingId } = body as Record<string, unknown>;
  if (!roomName || typeof roomName !== "string") {
    return NextResponse.json({ error: "roomName required" }, { status: 400 });
  }
  if (!meetingId || typeof meetingId !== "string") {
    return NextResponse.json({ error: "meetingId required" }, { status: 400 });
  }

  // Only host of the meeting can start recording
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  if (meeting.hostId !== user.id) {
    return NextResponse.json({ error: "Forbidden — only host can record" }, { status: 403 });
  }

  // Enforce max recordings per account (use meetings with isRecorded=true as source of truth)
  const recordingCount = await prisma.meeting.count({
    where: { hostId: user.id, isRecorded: true },
  });

  if (recordingCount >= MAX_RECORDINGS_PER_ACCOUNT) {
    return NextResponse.json({
      error: `Batas rekaman tercapai (maksimal ${MAX_RECORDINGS_PER_ACCOUNT} rekaman per akun). Hapus rekaman lama untuk merekam baru.`,
      limitReached: true,
      current: recordingCount,
      max: MAX_RECORDINGS_PER_ACCOUNT,
    }, { status: 429 });
  }

  // Validate required env vars
  const livekitUrl = getLiveKitHttpUrl();
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

    const filename = `recordings/${meetingId}/${roomName}-${Date.now()}.mp4`;

    const s3 = new S3Upload({
      bucket: s3Bucket,
      region: s3Region,
      ...(s3Key && s3Secret ? { accessKey: s3Key, secret: s3Secret } : {}),
    });

    const output = new EncodedFileOutput({
      filepath: filename,
      output: { case: "s3", value: s3 },
    });

    const egress = await egressClient.startRoomCompositeEgress(roomName, { file: output });

    // Mark meeting as recording-started (the webhook will set isRecorded=true on egress_ended)
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { isRecorded: false }, // will be set true by webhook on egress_ended
    }).catch(() => {});

    return NextResponse.json({
      egressId: egress.egressId,
      status: "started",
      remaining: MAX_RECORDINGS_PER_ACCOUNT - recordingCount - 1,
    });
  } catch (err) {
    console.error("Recording start error:", err);
    return NextResponse.json({ error: "Failed to start recording" }, { status: 500 });
  }
}
