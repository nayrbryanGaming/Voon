import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function isValidUsername(u: string) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(u);
}

export async function POST(req: Request) {
  try {
    const { name, username, email, password } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }
    if (!username || typeof username !== "string" || !isValidUsername(username)) {
      return NextResponse.json(
        { error: "Username must be 3-20 chars, alphanumeric + underscore only" },
        { status: 400 }
      );
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Check duplicates
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          { email: email.toLowerCase() },
        ],
      },
    });
    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    // Auto-detect campus from email domain
    const emailDomain = email.split("@")[1]?.toLowerCase() ?? "";
    let campusId: string | null = null;
    if (emailDomain) {
      const campus = await prisma.campus.findUnique({ where: { domain: emailDomain } });
      if (campus) campusId = campus.id;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        ...(campusId ? { campusId } : {}),
      },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
