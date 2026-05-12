import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { cleanupCaption } from "@/lib/anthropic";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rawText, language } = await req.json();
  if (!rawText) return NextResponse.json({ error: "rawText required" }, { status: 400 });

  try {
    const cleaned = await cleanupCaption(rawText, language ?? "id-ID");
    return NextResponse.json({ text: cleaned });
  } catch (err) {
    console.error("AI captions error:", err);
    return NextResponse.json({ text: rawText }); // fallback to raw
  }
}
