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

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/sign-in");

  const meetings = await prisma.meeting.findMany({
    where: { hostId: user.id, isRecorded: true, recordingUrl: { not: null } },
    orderBy: { startTime: "desc" },
    include: { summary: { select: { topics: true } } },
  });

  return (
    <div className="min-h-screen">
      <Topbar title="Rekaman" />
      <RecordingsContent meetings={meetings} totalCount={meetings.length} />
    </div>
  );
}
