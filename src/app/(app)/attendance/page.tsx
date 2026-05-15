import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { AttendanceContent } from "./AttendanceContent";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  const result = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.meeting.findMany({
      where: { hostId: userId, status: "ENDED" },
      orderBy: { startTime: "desc" },
      take: 20,
      include: {
        attendance: {
          include: { user: { select: { name: true, email: true, avatarUrl: true } } },
        },
        _count: { select: { attendance: true } },
      },
    }),
  ]).catch((err) => {
    console.error("[Attendance] DB error:", err);
    return null;
  });

  if (!result || !result[0]) redirect("/sign-in");

  const [, meetings] = result;

  return (
    <div className="min-h-screen">
      <Topbar title="Kehadiran" />
      <AttendanceContent meetings={meetings} />
    </div>
  );
}
