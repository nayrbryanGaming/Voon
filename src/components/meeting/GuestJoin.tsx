"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GuestJoinProps {
  roomId: string;
  meetingId: string;
  meetingTitle: string;
}

export function GuestJoin({ roomId, meetingTitle }: GuestJoinProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Masukkan nama tampilan Anda.");
      return;
    }
    setLoading(true);
    setError("");

    // Store guest name in sessionStorage so MeetingRoom can pick it up
    sessionStorage.setItem("voon_guest_name", displayName.trim());
    sessionStorage.setItem("voon_guest_room", roomId);

    // Navigate to the room — MeetingRoom will use guestName from sessionStorage
    router.push(`/room/${roomId}?guest=${encodeURIComponent(displayName.trim())}`);
  }

  return (
    <div className="min-h-screen bg-[var(--voon-bg)] flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[var(--voon-bg-card)] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">V</div>
          <span className="text-white font-bold text-xl">Voon</span>
        </div>

        <h2 className="text-white font-bold text-xl mb-1">Bergabung sebagai Tamu</h2>
        <p className="text-gray-400 text-sm mb-1">Meeting: <span className="text-white">{meetingTitle}</span></p>
        <p className="text-gray-500 text-xs mb-6">
          Masukkan nama yang akan ditampilkan ke peserta lain.
        </p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1.5" htmlFor="displayName">
              Nama Tampilan
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              required
              maxLength={50}
              className="w-full px-4 py-2.5 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 text-sm"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? "Bergabung..." : "Masuk ke Meeting"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-white/5 text-center">
          <p className="text-gray-500 text-xs">
            Punya akun?{" "}
            <Link href="/sign-in" className="text-blue-400 hover:text-blue-300">
              Masuk untuk fitur lengkap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
