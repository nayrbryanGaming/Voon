import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { RecapContent } from "./RecapContent";

export default async function RecapPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      summary: true,
      transcript: true,
      attendance: {
        include: { user: { select: { name: true, avatarUrl: true, email: true } } },
      },
      _count: { select: { attendance: true } },
    },
  });

  if (!meeting) notFound();

  return (
    <div className="min-h-screen">
      <Topbar title="Rekap Meeting" />
      <RecapContent meeting={meeting} />
    </div>
  );
}
