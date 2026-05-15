import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { MeetingCard } from "@/components/meeting/MeetingCard";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  const result = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.meeting.findMany({
      where: { hostId: userId },
      orderBy: { startTime: "desc" },
      include: {
        _count: { select: { attendance: true, participants: true } },
        summary: { select: { summary: true } },
      },
    }),
  ]).catch((err) => {
    console.error("[Meetings] DB error:", err);
    return null;
  });

  if (!result || !result[0]) redirect("/sign-in");

  const [user, meetings] = result;

  return (
    <div className="min-h-screen">
      <Topbar title="Pertemuan" />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Semua Pertemuan</h1>
            <p className="text-gray-400 mt-1">{meetings.length} meeting total</p>
          </div>
          <Link
            href="/meetings/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Buat Meeting
          </Link>
        </div>

        {meetings.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Belum ada meeting</h3>
            <p className="text-sm mb-6">Buat meeting pertama Anda untuk memulai</p>
            <Link
              href="/meetings/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Buat Meeting Pertama
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
