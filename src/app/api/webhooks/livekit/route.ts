import { NextResponse } from "next/server";
import { WebhookReceiver, WebhookEvent } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { summarizeMeeting, extractActionItems } from "@/lib/anthropic";

export async function POST(req: Request) {
  const body = await req.text();
  const authorization = req.headers.get("Authorization");

  const receiver = new WebhookReceiver(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!
  );

  let event: WebhookEvent;
  try {
    event = await Promise.resolve(receiver.receive(body, authorization ?? ""));
  } catch {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  const roomName = event?.room?.name;
  if (!roomName) return NextResponse.json({ success: true });

  const meeting = await prisma.meeting.findUnique({ where: { roomId: roomName } });
  if (!meeting) return NextResponse.json({ success: true });

  switch (event.event) {
    case "room_started":
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { status: "LIVE" },
      });
      break;

    case "room_finished": {
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          status: "ENDED",
          endTime: new Date(),
          duration: Math.round((Date.now() - meeting.startTime.getTime()) / 1000),
        },
      });

      // Auto-generate AI summary if transcript exists
      const transcript = await prisma.transcript.findUnique({ where: { meetingId: meeting.id } });
      if (transcript && !await prisma.meetingSummary.findUnique({ where: { meetingId: meeting.id } })) {
        try {
          const duration = Math.round((Date.now() - meeting.startTime.getTime()) / 1000);
          const summaryData = await summarizeMeeting(transcript.content, meeting.title, duration);
          const actionData = await extractActionItems(transcript.content);

          await prisma.meetingSummary.create({
            data: {
              meetingId: meeting.id,
              summary: summaryData.summary,
              keyPoints: summaryData.keyPoints ?? [],
              actionItems: actionData.actionItems?.map((a: { task: string; assignee: string }) => `${a.task} (${a.assignee})`) ?? [],
              topics: summaryData.topics ?? [],
              sentiment: summaryData.sentiment ?? null,
            },
          });
        } catch (err) {
          console.error("AI summary failed:", err);
        }
      }
      break;
    }

    case "participant_joined": {
      const participantId = event.participant?.identity;
      if (!participantId) break;

      const user = await prisma.user.findUnique({ where: { id: participantId } });
      if (!user) break;

      const startTime = new Date(meeting.startTime);
      const now = new Date();
      const lateThreshold = 15 * 60 * 1000; // 15 minutes
      const isLate = now.getTime() - startTime.getTime() > lateThreshold;

      await prisma.attendance.upsert({
        where: { meetingId_userId: { meetingId: meeting.id, userId: user.id } },
        create: {
          meetingId: meeting.id,
          userId: user.id,
          joinedAt: now,
          status: isLate ? "LATE" : "PRESENT",
        },
        update: { joinedAt: now, status: isLate ? "LATE" : "PRESENT" },
      });
      break;
    }

    case "participant_left": {
      const participantId = event.participant?.identity;
      if (!participantId) break;

      const user = await prisma.user.findUnique({ where: { id: participantId } });
      if (!user) break;

      const attendance = await prisma.attendance.findUnique({
        where: { meetingId_userId: { meetingId: meeting.id, userId: user.id } },
      });

      if (attendance) {
        const duration = Math.round((Date.now() - attendance.joinedAt.getTime()) / 1000);
        await prisma.attendance.update({
          where: { id: attendance.id },
          data: { leftAt: new Date(), duration },
        });
      }
      break;
    }

    case "egress_ended": {
      const egressInfo = event.egressInfo;
      if (egressInfo?.fileResults?.[0]?.filename) {
        await prisma.meeting.update({
          where: { id: meeting.id },
          data: { recordingUrl: egressInfo.fileResults[0].filename },
        });
      }
      break;
    }
  }

  return NextResponse.json({ success: true });
}
