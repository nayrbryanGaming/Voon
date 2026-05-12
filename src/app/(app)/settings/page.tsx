import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { UserButton } from "@clerk/nextjs";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  return (
    <div className="min-h-screen">
      <Topbar title="Pengaturan" />
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Pengaturan Akun</h1>

        <div className="space-y-6">
          {/* Profile */}
          <div className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5">
            <h2 className="text-white font-semibold mb-4">Profil</h2>
            <div className="flex items-center gap-4">
              <UserButton appearance={{ elements: { avatarBox: "w-16 h-16" } }} />
              <div>
                <p className="text-white font-medium">{user?.name ?? clerkUser?.fullName}</p>
                <p className="text-gray-400 text-sm">{user?.email ?? clerkUser?.primaryEmailAddress?.emailAddress}</p>
                <p className="text-xs text-blue-400 mt-1">
                  {user?.role === "LECTURER" ? "Dosen" : user?.role === "ADMIN" ? "Admin" : "Mahasiswa"}
                </p>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              Kelola profil Anda melalui tombol avatar di atas.
            </p>
          </div>

          {/* About */}
          <div className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5">
            <h2 className="text-white font-semibold mb-4">Tentang Voon</h2>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Versi: 0.1.0</p>
              <p>Stack: Next.js 15 · LiveKit · Anthropic AI · Supabase · Clerk</p>
              <p>Dibuat untuk kampus Indonesia. Gratis selamanya.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
