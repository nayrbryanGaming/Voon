import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { extractActionItems } from "@/lib/anthropic";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { transcript } = await req.json();
  if (!transcript) return NextResponse.json({ error: "transcript required" }, { status: 400 });

  try {
    const data = await extractActionItems(transcript);
    return NextResponse.json(data);
  } catch (err) {
    console.error("AI action-items error:", err);
    return NextResponse.json({ error: "AI service error" }, { status: 500 });
  }
}
