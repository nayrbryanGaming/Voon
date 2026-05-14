import { Topbar } from "@/components/layout/Topbar";
import { MeetingScheduler } from "@/components/meeting/MeetingScheduler";

export default async function NewMeetingPage({
  searchParams,
}: {
  searchParams: Promise<{ instant?: string }>;
}) {
  const sp = await searchParams;
  const instant = sp.instant === "true";

  return (
    <div className="min-h-screen">
      <Topbar title={instant ? "Meeting Instan" : "Buat Meeting"} />
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">
          {instant ? "Mulai Meeting Instan" : "Buat Meeting Baru"}
        </h1>
        <p className="text-gray-400 mb-8">
          {instant
            ? "Meeting akan langsung dimulai sekarang."
            : "Isi detail meeting Anda di bawah ini."}
        </p>
        <MeetingScheduler instant={instant} />
      </div>
    </div>
  );
}
