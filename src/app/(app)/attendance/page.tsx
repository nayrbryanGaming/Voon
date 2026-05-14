import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { AttendanceContent } from "./AttendanceContent";

export default async function AttendancePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/sign-in");

  const meetings = await prisma.meeting.findMany({
    where: { hostId: user.id, status: "ENDED" },
    orderBy: { startTime: "desc" },
    take: 20,
    include: {
      attendance: {
        include: { user: { select: { name: true, email: true, avatarUrl: true } } },
      },
      _count: { select: { attendance: true } },
    },
  });

  return (
    <div className="min-h-screen">
      <Topbar title="Kehadiran" />
      <AttendanceContent meetings={meetings} />
    </div>
  );
}
