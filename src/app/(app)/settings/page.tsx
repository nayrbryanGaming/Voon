import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { UserButton } from "@clerk/nextjs";
import { GraduationCap, Shield, Info, Mail, User } from "lucide-react";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { campus: true },
  });

  const roleLabel =
    user?.role === "LECTURER" ? "Dosen" : user?.role === "ADMIN" ? "Admin" : "Mahasiswa";

  const totalMeetings = await prisma.meeting.count({ where: { hostId: user?.id ?? "" } });
  const totalAttended = await prisma.attendance.count({ where: { userId: user?.id ?? "" } });

  return (
    <div className="min-h-screen">
      <Topbar title="Pengaturan" />
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Pengaturan Akun</h1>

        {/* Profile */}
        <div className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Profil
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <UserButton appearance={{ elements: { avatarBox: "w-16 h-16" } }} />
            <div>
              <p className="text-white font-medium">{user?.name ?? clerkUser?.fullName}</p>
              <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email ?? clerkUser?.primaryEmailAddress?.emailAddress}
              </p>
              <span className="inline-block text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full mt-1.5">
                {roleLabel}
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Kelola foto profil dan nama melalui tombol avatar di atas.</p>
        </div>

        {/* Campus */}
        {user?.campus && (
          <div className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              Kampus
            </h2>
            <p className="text-white font-medium">{user.campus.name}</p>
            {user.campus.domain && (
              <p className="text-gray-400 text-sm mt-1">Domain: @{user.campus.domain}</p>
            )}
          </div>
        )}

        {/* Activity Stats */}
        <div className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            Aktivitas
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-2xl font-bold text-white">{totalMeetings}</p>
              <p className="text-xs text-gray-500 mt-1">Meeting dibuat</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-2xl font-bold text-white">{totalAttended}</p>
              <p className="text-xs text-gray-500 mt-1">Meeting dihadiri</p>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-400" />
            Tentang Voon
          </h2>
          <div className="space-y-2 text-sm text-gray-400">
            <p>Versi: 0.1.0</p>
            <p>Stack: Next.js 15 · LiveKit · Anthropic Claude AI · Supabase · Clerk</p>
            <p className="text-emerald-400">Gratis selamanya untuk kampus Indonesia 🎓</p>
          </div>
        </div>
      </div>
    </div>
  );
}
