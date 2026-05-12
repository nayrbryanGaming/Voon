import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-8xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-400 text-xl mb-8">Halaman tidak ditemukan</p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
