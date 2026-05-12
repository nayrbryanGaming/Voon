export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--voon-bg)]">
      <Sidebar />
      <div className="lg:pl-60">
        {children}
      </div>
    </div>
  );
}
