import { getServerUserId } from "@/lib/session";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { nanoid } from "nanoid";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

const ALLOWED_TYPES: Record<string, string[]> = {
  recordings: ["video/mp4", "video/webm", "audio/mp4", "audio/webm"],
  avatars: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  attachments: ["application/pdf", "image/jpeg", "image/png", "text/plain"],
};

export async function POST(req: Request) {
  const userId = await getServerUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const bucket = (formData.get("bucket") as string) ?? "recordings";

  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  const allowedBuckets = ["recordings", "avatars", "attachments"];
  if (!allowedBuckets.includes(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 500 MB)" }, { status: 413 });
  }

  const allowed = ALLOWED_TYPES[bucket] ?? [];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed for this bucket" }, { status: 415 });
  }

  const rawExt = file.name.split(".").pop() ?? "bin";
  const safeExt = rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  const path = `${userId}/${nanoid()}.${safeExt}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file);

  if (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: publicUrl } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);
  return NextResponse.json({ url: publicUrl.publicUrl });
}
