export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MeetingRoom } from "@/components/meeting/MeetingRoom";

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { roomId } = await params;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const meeting = await prisma.meeting.findUnique({
    where: { roomId },
    include: { host: { select: { id: true, name: true } } },
  });

  if (!meeting || meeting.status === "CANCELLED") {
    redirect("/dashboard");
  }

  const isHost = meeting.host?.id === user.id;

  return (
    <MeetingRoom
      roomId={roomId}
      meetingId={meeting.id}
      meetingTitle={meeting.title}
      userId={user.id}
      userName={user.name}
      isHost={isHost}
    />
  );
}
