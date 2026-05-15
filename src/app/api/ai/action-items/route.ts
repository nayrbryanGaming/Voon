import { getServerUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { extractActionItems } from "@/lib/ai";
import { checkRateLimit, sanitizeString, withSecureHeaders } from "@/lib/api-security";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) return withSecureHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));

  const limited = checkRateLimit(req, 10);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return withSecureHeaders(NextResponse.json({ error: "Invalid JSON" }, { status: 400 }));
  }

  const { transcript } = body as Record<string, unknown>;
  if (!transcript || typeof transcript !== "string") {
    return withSecureHeaders(NextResponse.json({ error: "transcript required" }, { status: 400 }));
  }

  try {
    const data = await extractActionItems(sanitizeString(String(transcript), 50_000));
    return withSecureHeaders(NextResponse.json(data));
  } catch (err) {
    console.error("AI action-items error:", err);
    return withSecureHeaders(NextResponse.json({ error: "AI service error" }, { status: 500 }));
  }
}
