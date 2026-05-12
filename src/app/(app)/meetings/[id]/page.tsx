import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { MeetingLobby } from "@/components/meeting/MeetingLobby";

export default async function MeetingLobbyPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      host: { select: { name: true, avatarUrl: true } },
      _count: { select: { participants: true } },
    },
  });

  if (!meeting) notFound();

  return (
    <div className="min-h-screen">
      <Topbar title={meeting.title} />
      <MeetingLobby meeting={meeting} />
    </div>
  );
}
