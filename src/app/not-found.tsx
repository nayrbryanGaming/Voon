import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center text-center px-4">
      <div className="max-w-md">
        {/* Glowing 404 */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
          <h1 className="relative text-9xl font-bold bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-3">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Halaman yang Anda cari tidak ada, telah dipindahkan, atau URL salah.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            Beranda
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:bg-white/5 text-gray-300 rounded-xl font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
