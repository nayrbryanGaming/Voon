import { NextRequest, NextResponse } from "next/server";
import { getServerUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, maskToken } from "@/lib/crypto";

export const dynamic = "force-dynamic";

// Allowed token prefixes — prevents storing arbitrary secrets
const VALID_PREFIXES = [
  "gsk_",        // Groq
  "sk-ant-",     // Anthropic
  "sk-",         // OpenAI compat
];

function isValidTokenFormat(token: string): boolean {
  if (token.length < 20 || token.length > 512) return false;
  return VALID_PREFIXES.some((p) => token.startsWith(p));
}

/** GET /api/user/token — returns masked token + provider hint */
export async function GET() {
  const userId = await getServerUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { apiTokenEncrypted: true, subscriptionTier: true },
  });

  if (!user?.apiTokenEncrypted) {
    return NextResponse.json({ hasToken: false, masked: null, provider: null });
  }

  const plain = decrypt(user.apiTokenEncrypted);
  if (!plain) {
    return NextResponse.json({ hasToken: false, masked: null, provider: null });
  }

  const provider = plain.startsWith("gsk_") ? "groq" : plain.startsWith("sk-ant-") ? "anthropic" : "openai";
  return NextResponse.json({
    hasToken: true,
    masked: maskToken(plain),
    provider,
    tier: user.subscriptionTier,
  });
}

/** POST /api/user/token — save encrypted token */
export async function POST(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { token, tier } = body as { token?: string; tier?: string };

  // Handle token deletion
  if (!token || token === "") {
    await prisma.user.update({
      where: { id: userId },
      data: { apiTokenEncrypted: null },
    });
    return NextResponse.json({ success: true, action: "deleted" });
  }

  if (!isValidTokenFormat(token)) {
    return NextResponse.json({
      error: "Format token tidak valid. Token harus dimulai dengan gsk_ (Groq) atau sk-ant- (Anthropic).",
    }, { status: 422 });
  }

  const encrypted = encrypt(token);

  const updateData: Record<string, unknown> = { apiTokenEncrypted: encrypted };
  if (tier === "PREMIUM" || tier === "FREE") {
    updateData.subscriptionTier = tier;
  }
  // Auto-upgrade to PREMIUM when a valid token is saved
  if (!tier) updateData.subscriptionTier = "PREMIUM";

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return NextResponse.json({ success: true, action: "saved" });
}

/** DELETE /api/user/token — remove token + downgrade to FREE */
export async function DELETE() {
  const userId = await getServerUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.update({
    where: { id: userId },
    data: { apiTokenEncrypted: null, subscriptionTier: "FREE" },
  });

  return NextResponse.json({ success: true });
}
