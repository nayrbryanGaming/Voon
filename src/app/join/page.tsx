"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, ArrowRight, Loader2 } from "lucide-react";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    router.push(`/join/${trimmed}`);
  };

  return (
    <div className="min-h-screen bg-[var(--voon-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4">
            V
          </div>
          <h1 className="text-2xl font-bold text-white">Bergabung ke Meeting</h1>
          <p className="text-gray-400 mt-2 text-sm">Masukkan kode undangan dari host</p>
        </div>

        <form
          onSubmit={handleJoin}
          className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Kode Meeting
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Contoh: ABC123XY"
                maxLength={20}
                className="w-full pl-9 pr-4 py-3 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 text-sm tracking-widest font-mono"
              />
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Bergabung
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Atau{" "}
          <a href="/meetings/new" className="text-blue-400 hover:text-blue-300">
            buat meeting baru
          </a>
        </p>
      </div>
    </div>
  );
}
