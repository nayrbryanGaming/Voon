import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  const headersList = await headers();
  const svix_id = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: { type: string; data: { id: string; email_addresses: Array<{ email_address: string }>; first_name: string; last_name: string; image_url: string } };

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as typeof evt;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = evt;

  if (type === "user.created" || type === "user.updated") {
    const email = data.email_addresses?.[0]?.email_address ?? "";
    const name = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || "Pengguna";

    // Auto-detect campus from email domain (e.g. user@unhas.ac.id → Campus {domain: "unhas.ac.id"})
    const emailDomain = email.split("@")[1]?.toLowerCase() ?? "";
    let campusId: string | null = null;
    if (emailDomain) {
      const campus = await prisma.campus.findUnique({ where: { domain: emailDomain } });
      if (campus) campusId = campus.id;
    }

    await prisma.user.upsert({
      where: { clerkId: data.id },
      create: {
        clerkId: data.id,
        email,
        name,
        avatarUrl: data.image_url || null,
        ...(campusId ? { campusId } : {}),
      },
      update: {
        email,
        name,
        avatarUrl: data.image_url || null,
        ...(campusId ? { campusId } : {}),
      },
    });
  }

  return NextResponse.json({ success: true });
}
