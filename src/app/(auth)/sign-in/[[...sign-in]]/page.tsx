"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Username atau password salah.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--voon-bg)] flex items-center justify-center">
      <Link href="/" className="flex items-center gap-2 justify-center absolute top-8 left-1/2 -translate-x-1/2 group">
        <div className="w-10 h-10 rounded-xl bg-blue-600 group-hover:bg-blue-500 transition-colors flex items-center justify-center font-bold text-white text-lg">V</div>
        <span className="text-white font-bold text-2xl">Voon</span>
      </Link>

      <div className="w-full max-w-md p-8 rounded-2xl bg-[var(--voon-bg-card)] border border-white/10 shadow-2xl">
        <h2 className="text-white font-bold text-2xl mb-1">Masuk ke Voon</h2>
        <p className="text-gray-400 text-sm mb-6">Platform meeting gratis untuk kampus</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1.5" htmlFor="username">
              Username atau Email
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username atau email@kampus.ac.id"
              required
              className="w-full px-4 py-2.5 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              required
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
            {loading ? "Memuat..." : "Masuk"}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-gray-400 text-sm">
            Belum punya akun?{" "}
            <Link href="/sign-up" className="text-blue-400 hover:text-blue-300">
              Daftar sekarang
            </Link>
          </p>
          <p className="text-gray-500 text-xs">atau</p>
          <Link
            href="/join"
            className="block text-sm text-gray-400 hover:text-white transition-colors"
          >
            Bergabung sebagai tamu →
          </Link>
        </div>
      </div>
    </div>
  );
}
