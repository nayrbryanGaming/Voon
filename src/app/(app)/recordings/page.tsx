import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { RecordingsContent } from "./RecordingsContent";

export default async function RecordingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const meetings = await prisma.meeting.findMany({
    where: { hostId: user.id, isRecorded: true, recordingUrl: { not: null } },
    orderBy: { startTime: "desc" },
    include: { summary: { select: { topics: true } } },
  });

  return (
    <div className="min-h-screen">
      <Topbar title="Rekaman" />
      <RecordingsContent meetings={meetings} />
    </div>
  );
}
