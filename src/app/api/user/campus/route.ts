import { getServerUserId } from "@/lib/session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/user/campus — returns current user's campus info (if any)
export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json(null);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        campus: {
          select: { id: true, name: true, domain: true, logoUrl: true },
        },
      },
    });

    return NextResponse.json(user?.campus ?? null);
  } catch {
    return NextResponse.json(null);
  }
}
