import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const meeting = await prisma.meeting.findUnique({ where: { inviteCode: code } });

  if (!meeting) {
    redirect("/dashboard?error=invalid-code");
  }

  // If logged in, go to meeting lobby; if guest, go directly to room
  const session = await auth();
  if (session?.user?.id) {
    redirect(`/meetings/${meeting.id}`);
  } else {
    redirect(`/room/${meeting.roomId}`);
  }
}
