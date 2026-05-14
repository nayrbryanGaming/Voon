"use client";

import dynamic from "next/dynamic";

// Load Clerk SignIn only on client (no SSR) to prevent 500 when keys aren't set
const ClerkSignIn = dynamic(
  () => import("@clerk/nextjs").then((m) => m.SignIn),
  { ssr: false, loading: () => <div className="w-96 h-60 rounded-2xl bg-[var(--voon-bg-card)] animate-pulse" /> }
);

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const isClerkConfigured = clerkKey.startsWith("pk_") && clerkKey.length > 20;

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[var(--voon-bg)] flex items-center justify-center">
      <div className="text-center mb-8 absolute top-8 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 justify-center">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-lg">V</div>
          <span className="text-white font-bold text-2xl">Voon</span>
        </div>
      </div>

      {isClerkConfigured ? (
        <ClerkSignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-[var(--voon-bg-card)] border border-white/10 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              formFieldLabel: "text-gray-300",
              formFieldInput: "bg-[var(--voon-bg-elevated)] border-white/10 text-white",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-500",
              footerActionLink: "text-blue-400 hover:text-blue-300",
            },
          }}
        />
      ) : (
        <div className="w-full max-w-md p-8 rounded-2xl bg-[var(--voon-bg-card)] border border-white/10 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚙️</span>
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Setup Diperlukan</h2>
          <p className="text-gray-400 text-sm mb-4">
            Autentikasi belum dikonfigurasi. Admin perlu mengatur API key Clerk di Vercel.
          </p>
          <div className="text-xs text-gray-500 bg-white/5 rounded-xl p-3 text-left font-mono break-all">
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...<br />
            CLERK_SECRET_KEY=sk_live_...
          </div>
          <a href="/" className="mt-4 inline-block text-blue-400 hover:text-blue-300 text-sm">
            ← Kembali ke Beranda
          </a>
        </div>
      )}
    </div>
  );
}
