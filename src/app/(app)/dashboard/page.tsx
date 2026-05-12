import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { DashboardContent } from "./DashboardContent";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      hostedMeetings: {
        where: { status: { in: ["SCHEDULED", "LIVE"] } },
        orderBy: { startTime: "asc" },
        take: 5,
      },
    },
  });

  const recentMeetings = await prisma.meeting.findMany({
    where: { hostId: user?.id ?? "" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { summary: true, _count: { select: { attendance: true } } },
  });

  const stats = {
    totalMeetings: await prisma.meeting.count({ where: { hostId: user?.id ?? "" } }),
    totalAttendance: await prisma.attendance.count({ where: { userId: user?.id ?? "" } }),
  };

  return (
    <div className="min-h-screen">
      <Topbar title="Dashboard" />
      <DashboardContent
        user={user}
        upcomingMeetings={user?.hostedMeetings ?? []}
        recentMeetings={recentMeetings}
        stats={stats}
      />
    </div>
  );
}
