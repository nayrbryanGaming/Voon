import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { EgressClient, EncodedFileOutput, S3Upload } from "livekit-server-sdk";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { roomName, meetingId } = await req.json();
  if (!roomName || !meetingId) {
    return NextResponse.json({ error: "roomName and meetingId required" }, { status: 400 });
  }

  try {
    const egressClient = new EgressClient(
      process.env.LIVEKIT_URL ?? "",
      process.env.LIVEKIT_API_KEY ?? "",
      process.env.LIVEKIT_API_SECRET ?? ""
    );

    const s3 = new S3Upload({
      bucket: process.env.S3_BUCKET ?? "voon-recordings",
      region: process.env.S3_REGION ?? "ap-southeast-1",
      accessKey: process.env.S3_ACCESS_KEY ?? "",
      secret: process.env.S3_SECRET_KEY ?? "",
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
