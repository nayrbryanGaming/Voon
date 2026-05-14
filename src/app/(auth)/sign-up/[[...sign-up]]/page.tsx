"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password tidak cocok.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      setError("Username 3-20 karakter, hanya huruf, angka, dan underscore.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Pendaftaran gagal.");
        return;
      }

      // Auto sign in after register
      const result = await signIn("credentials", {
        username: form.username,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Akun dibuat, namun gagal masuk otomatis. Silakan masuk manual.");
        router.push("/sign-in");
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
    <div className="min-h-screen bg-[var(--voon-bg)] flex items-center justify-center py-12">
      <div className="text-center mb-8 absolute top-8 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 justify-center">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-lg">V</div>
          <span className="text-white font-bold text-2xl">Voon</span>
        </div>
      </div>

      <div className="w-full max-w-md p-8 rounded-2xl bg-[var(--voon-bg-card)] border border-white/10 shadow-2xl">
        <h2 className="text-white font-bold text-2xl mb-1">Buat Akun Voon</h2>
        <p className="text-gray-400 text-sm mb-6">Gratis selamanya untuk kampus Indonesia</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1.5" htmlFor="name">
              Nama Lengkap
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama Lengkap"
              required
              minLength={2}
              className="w-full px-4 py-2.5 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1.5" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="contoh: budi_2024"
              required
              className="w-full px-4 py-2.5 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 text-sm"
            />
            <p className="text-gray-600 text-xs mt-1">3-20 karakter, huruf/angka/underscore</p>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@kampus.ac.id"
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
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimal 8 karakter"
              required
              minLength={8}
              className="w-full px-4 py-2.5 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1.5" htmlFor="confirmPassword">
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Ulangi password"
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
            {loading ? "Mendaftar..." : "Buat Akun"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Sudah punya akun?{" "}
          <Link href="/sign-in" className="text-blue-400 hover:text-blue-300">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
