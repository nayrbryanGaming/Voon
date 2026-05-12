import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const bucket = (formData.get("bucket") as string) ?? "recordings";

  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  const allowedBuckets = ["recordings", "avatars", "attachments"];
  if (!allowedBuckets.includes(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  const rawExt = file.name.split(".").pop() ?? "bin";
  const safeExt = rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  const path = `${userId}/${nanoid()}.${safeExt}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: publicUrl } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);
  return NextResponse.json({ url: publicUrl.publicUrl });
}
