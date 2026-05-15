import { getServerUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { summarizeMeeting } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, sanitizeString, withSecureHeaders } from "@/lib/api-security";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_TRANSCRIPT_LENGTH = 50_000; // ~50k chars ≈ 1hr meeting

export async function POST(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) return withSecureHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));

  // 10 AI calls per IP per hour
  const limited = checkRateLimit(req, 10);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return withSecureHeaders(NextResponse.json({ error: "Invalid JSON" }, { status: 400 }));
  }

  const { meetingId, transcript, title, duration } = body as Record<string, unknown>;

  if (!transcript || typeof transcript !== "string") {
    return withSecureHeaders(NextResponse.json({ error: "transcript required" }, { status: 400 }));
  }

  const safeTranscript = sanitizeString(String(transcript), MAX_TRANSCRIPT_LENGTH);
  const safeTitle = title ? sanitizeString(String(title), 200) : "Meeting";
  const safeDuration = typeof duration === "number" ? Math.max(0, Math.floor(duration)) : 0;

  // If meetingId provided, verify caller is the host
  if (meetingId && typeof meetingId === "string") {
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (meeting && meeting.hostId !== userId) {
      return withSecureHeaders(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
    }
  }

  try {
    const raw = await summarizeMeeting(safeTranscript, safeTitle, safeDuration);
    const data = raw as { summary?: string; keyPoints?: string[]; actionItems?: string[]; topics?: string[]; sentiment?: string };

    if (meetingId && typeof meetingId === "string") {
      await prisma.meetingSummary.upsert({
        where: { meetingId: String(meetingId) },
        create: {
          meetingId: String(meetingId),
          summary: data.summary ?? "",
          keyPoints: data.keyPoints ?? [],
          actionItems: data.actionItems ?? [],
          topics: data.topics ?? [],
          sentiment: data.sentiment ?? null,
        },
        update: {
          summary: data.summary ?? "",
          keyPoints: data.keyPoints ?? [],
          actionItems: data.actionItems ?? [],
          topics: data.topics ?? [],
          sentiment: data.sentiment ?? null,
        },
      });
    }

    return withSecureHeaders(NextResponse.json(raw));
  } catch (err) {
    console.error("AI summarize error:", err);
    return withSecureHeaders(NextResponse.json({ error: "AI service error" }, { status: 500 }));
  }
}
