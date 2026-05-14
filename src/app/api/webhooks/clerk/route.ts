import { NextResponse } from "next/server";

// Clerk webhook endpoint — kept as no-op since we've migrated to NextAuth.
// Existing data is preserved in the DB.
export async function POST() {
  return NextResponse.json({ success: true });
}
