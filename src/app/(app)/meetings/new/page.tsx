import { Topbar } from "@/components/layout/Topbar";
import { MeetingScheduler } from "@/components/meeting/MeetingScheduler";

export default function NewMeetingPage() {
  return (
    <div className="min-h-screen">
      <Topbar title="Buat Meeting" />
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Buat Meeting Baru</h1>
        <p className="text-gray-400 mb-8">Isi detail meeting Anda di bawah ini.</p>
        <MeetingScheduler />
      </div>
    </div>
  );
}
