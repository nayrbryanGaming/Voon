import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { DashboardContent } from "./DashboardContent";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

function DBErrorView() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-white font-semibold mb-2">Gagal Memuat Dashboard</h2>
        <p className="text-gray-500 text-sm mb-6">
          Database belum dikonfigurasi atau sedang tidak tersedia. Pastikan
          DATABASE_URL sudah diset di Vercel dan jalankan{" "}
          <code className="text-blue-400">prisma migrate deploy</code>.
        </p>
        <a
          href="/dashboard"
          className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Coba Lagi
        </a>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  const result = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        hostedMeetings: {
          where: { status: { in: ["SCHEDULED", "LIVE"] } },
          orderBy: { startTime: "asc" },
          take: 5,
        },
      },
    }),
    prisma.meeting.findMany({
      where: { hostId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { summary: true, _count: { select: { attendance: true } } },
    }),
    prisma.meeting.count({ where: { hostId: userId } }),
    prisma.attendance.count({ where: { userId } }),
  ]).catch((err) => {
    console.error("[Dashboard] DB error:", err);
    return null;
  });

  return (
    <div className="min-h-screen">
      <Topbar title="Dashboard" />
      {!result ? (
        <DBErrorView />
      ) : (
        <DashboardContent
          user={result[0]}
          upcomingMeetings={result[0]?.hostedMeetings ?? []}
          recentMeetings={result[1]}
          stats={{ totalMeetings: result[2], totalAttendance: result[3] }}
        />
      )}
    </div>
  );
}
