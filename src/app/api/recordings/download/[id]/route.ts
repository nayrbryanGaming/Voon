import { NextRequest, NextResponse } from "next/server";
import { getServerUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/recordings/download/[id]
// Returns a signed Supabase Storage URL for the recording identified by meeting id.
// The URL expires in 1 hour. Only the host or admin can download.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getServerUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: meetingId } = await params;
  if (!meetingId) return NextResponse.json({ error: "id required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

  // Only host or admin can download
  if (meeting.hostId !== userId && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!meeting.recordingUrl) {
    return NextResponse.json({ error: "No recording available" }, { status: 404 });
  }

  // If it's already a full HTTP URL, return it directly (e.g., S3 public URL)
  if (meeting.recordingUrl.startsWith("http://") || meeting.recordingUrl.startsWith("https://")) {
    return NextResponse.json({ url: meeting.recordingUrl, expiresIn: null });
  }

  // Otherwise treat as Supabase Storage path and generate signed URL
  try {
    const path = meeting.recordingUrl.startsWith("recordings/")
      ? meeting.recordingUrl
      : `recordings/${meeting.recordingUrl}`;

    const { data, error } = await supabaseAdmin.storage
      .from("recordings")
      .createSignedUrl(path, 3600); // 1 hour

    if (error || !data?.signedUrl) {
      console.error("Signed URL error:", error);
      return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 });
    }

    return NextResponse.json({
      url: data.signedUrl,
      filename: `${meeting.title.replace(/[^a-z0-9]/gi, "_")}_recording.mp4`,
      expiresIn: 3600,
    });
  } catch (err) {
    console.error("Download route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
