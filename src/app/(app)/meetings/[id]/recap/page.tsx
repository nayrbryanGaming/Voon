import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { RecapContent } from "./RecapContent";

export default async function RecapPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      summary: true,
      transcript: true,
      attendance: {
        include: { user: { select: { name: true, avatarUrl: true, email: true } } },
      },
      _count: { select: { attendance: true } },
    },
  });

  if (!meeting) notFound();

  // Authorize: only host or attendees may view recap
  const isHost = meeting.hostId === user.id;
  if (!isHost) {
    const attendance = await prisma.attendance.findUnique({
      where: { meetingId_userId: { meetingId: id, userId: user.id } },
    });
    if (!attendance) redirect("/dashboard?error=forbidden");
  }

  return (
    <div className="min-h-screen">
      <Topbar title="Rekap Meeting" />
      <RecapContent meeting={meeting} />
    </div>
  );
}
