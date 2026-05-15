import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { RecordingsContent } from "./RecordingsContent";

export const dynamic = "force-dynamic";

export default async function RecordingsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  const result = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.meeting.findMany({
      where: { hostId: userId, isRecorded: true, recordingUrl: { not: null } },
      orderBy: { startTime: "desc" },
      include: { summary: { select: { topics: true } } },
    }),
  ]).catch((err) => {
    console.error("[Recordings] DB error:", err);
    return null;
  });

  if (!result || !result[0]) redirect("/sign-in");

  const [, meetings] = result;

  return (
    <div className="min-h-screen">
      <Topbar title="Rekaman" />
      <RecordingsContent meetings={meetings} totalCount={meetings.length} />
    </div>
  );
}
