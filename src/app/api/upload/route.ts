import { getServerUserId } from "@/lib/session";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB (recordings)
const MAX_ATTACH_SIZE = 10 * 1024 * 1024; // 10 MB (chat attachments)
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;  // 5 MB (avatars)

const ALLOWED_TYPES: Record<string, string[]> = {
  recordings:  ["video/mp4", "video/webm", "audio/mp4", "audio/webm"],
  avatars:     ["image/jpeg", "image/png", "image/webp", "image/gif"],
  attachments: [
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "video/mp4", "video/webm",
    "application/pdf", "text/plain",
  ],
};

const BUCKET_MAX_SIZE: Record<string, number> = {
  recordings:  MAX_FILE_SIZE,
  avatars:     MAX_AVATAR_SIZE,
  attachments: MAX_ATTACH_SIZE,
};

// Validate bucket name against allowlist to prevent open redirect to arbitrary buckets
const ALLOWED_BUCKETS = new Set(["recordings", "avatars", "attachments"]);

export async function POST(req: Request) {
  const userId = await getServerUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const bucket = (formData.get("bucket") as string) ?? "recordings";

  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  const maxSize = BUCKET_MAX_SIZE[bucket] ?? MAX_ATTACH_SIZE;
  if (file.size > maxSize) {
    return NextResponse.json({
      error: `File terlalu besar (maks ${Math.round(maxSize / 1024 / 1024)} MB)`,
    }, { status: 413 });
  }

  const allowed = ALLOWED_TYPES[bucket] ?? [];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Tipe file tidak diizinkan" }, { status: 415 });
  }

  // Sanitize extension — only alphanumeric, max 10 chars
  const rawExt = file.name.split(".").pop() ?? "bin";
  const safeExt = rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  const path = `${userId}/${nanoid()}.${safeExt}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file);

  if (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload gagal" }, { status: 500 });
  }

  const { data: publicUrl } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);
  return NextResponse.json({ url: publicUrl.publicUrl, path: data.path });
}
