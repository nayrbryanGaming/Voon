import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { code } = await params;
  const meeting = await prisma.meeting.findUnique({ where: { inviteCode: code } });

  if (!meeting) {
    redirect("/dashboard?error=invalid-code");
  }

  redirect(`/meetings/${meeting.id}`);
}
