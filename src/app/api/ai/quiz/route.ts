import { getServerUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/ai";
import { checkRateLimit, sanitizeString, withSecureHeaders } from "@/lib/api-security";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const VALID_DIFFICULTIES = ["easy", "medium", "hard"] as const;

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

  const { transcript, topic, difficulty } = body as Record<string, unknown>;

  if (!transcript || typeof transcript !== "string") {
    return withSecureHeaders(NextResponse.json({ error: "transcript required" }, { status: 400 }));
  }

  const safeDifficulty = VALID_DIFFICULTIES.includes(difficulty as typeof VALID_DIFFICULTIES[number])
    ? (difficulty as typeof VALID_DIFFICULTIES[number])
    : "medium";

  try {
    const data = await generateQuiz(
      sanitizeString(String(transcript), 30_000),
      topic ? sanitizeString(String(topic), 200) : "Materi",
      safeDifficulty
    );
    return withSecureHeaders(NextResponse.json(data));
  } catch (err) {
    console.error("AI quiz error:", err);
    return withSecureHeaders(NextResponse.json({ error: "AI service error" }, { status: 500 }));
  }
}
