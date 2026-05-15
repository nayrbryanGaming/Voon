import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { GraduationCap, Shield, Info, Mail, User, Zap } from "lucide-react";
import { AITokenSection } from "./AITokenSection";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { campus: true },
  });

  if (!user) redirect("/sign-in");

  const roleLabel =
    user.role === "LECTURER" ? "Dosen" : user.role === "ADMIN" ? "Admin" : "Mahasiswa";

  const [totalMeetings, totalAttended] = await Promise.all([
    prisma.meeting.count({ where: { hostId: user.id } }),
    prisma.attendance.count({ where: { userId: user.id } }),
  ]);

  const subscriptionTier = user.subscriptionTier ?? "FREE";
  const hasToken = !!user.apiTokenEncrypted;

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
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-2xl">
              {(user.name ?? session.user?.name ?? "?")[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">{user.name ?? session.user?.name}</p>
              <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email ?? session.user?.email}
              </p>
              {user.username && (
                <p className="text-gray-500 text-xs mt-0.5">@{user.username}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-block text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  {roleLabel}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                  subscriptionTier === "PREMIUM"
                    ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    : "text-gray-500 bg-white/5 border-white/10"
                }`}>
                  <Zap className="w-3 h-3" />
                  {subscriptionTier === "PREMIUM" ? "Premium" : "Free"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Campus */}
        {user.campus && (
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

        {/* AI Agent Token — client component */}
        <AITokenSection initialHasToken={hasToken} initialTier={subscriptionTier} />

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
            <p>Versi: 1.0.0</p>
            <p>Stack: Next.js 15 · LiveKit · Groq AI · Supabase · NextAuth</p>
            <p className="text-emerald-400">Gratis selamanya untuk kampus Indonesia</p>
            <p className="text-xs text-gray-600">AI default: Groq Llama 3.1 (gratis) · AI premium: token sendiri</p>
          </div>
        </div>
      </div>
    </div>
  );
}
