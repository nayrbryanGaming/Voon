export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MeetingRoom } from "@/components/meeting/MeetingRoom";
import { GuestJoin } from "@/components/meeting/GuestJoin";

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ guest?: string }>;
}) {
  const session = await auth();
  const { roomId } = await params;
  const sp = await searchParams;
  const guestName = sp.guest ? decodeURIComponent(sp.guest) : undefined;

  const meeting = await prisma.meeting.findUnique({
    where: { roomId },
    include: { host: { select: { id: true, name: true } } },
  });

  if (!meeting || meeting.status === "CANCELLED") {
    // Guests can't access /dashboard (protected) — redirect them to /join
    if (!session?.user?.id) {
      redirect("/join?error=not-found");
    }
    redirect("/dashboard");
  }

  // If not logged in and no guest name — show guest join form
  if (!session?.user?.id) {
    if (!guestName) {
      return (
        <GuestJoin
          roomId={roomId}
          meetingId={meeting.id}
          meetingTitle={meeting.title}
        />
      );
    }
    // Guest with a name — join directly
    return (
      <MeetingRoom
        roomId={roomId}
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        userId={`guest_${Date.now()}`}
        userName={guestName}
        isHost={false}
        guestName={guestName}
      />
    );
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/sign-in");

  const isHost = meeting.host?.id === user.id;

  // Bug 3: Update meeting status to LIVE when host joins
  if (isHost && meeting.status === "SCHEDULED") {
    try {
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { status: "LIVE" },
      });
    } catch {
      // Non-fatal: continue even if status update fails
    }
  }

  // Bug 4: Record attendance and participant for authenticated users
  try {
    if (!isHost) {
      await prisma.attendance.upsert({
        where: { meetingId_userId: { meetingId: meeting.id, userId: user.id } },
        create: { meetingId: meeting.id, userId: user.id, joinedAt: new Date(), status: "PRESENT" },
        update: { joinedAt: new Date() },
      });
    }
    await prisma.participant.upsert({
      where: { meetingId_userId: { meetingId: meeting.id, userId: user.id } },
      create: { meetingId: meeting.id, userId: user.id, role: isHost ? "HOST" : "ATTENDEE" },
      update: {},
    });
  } catch {
    // Non-fatal: continue even if attendance recording fails
  }

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
