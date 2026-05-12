"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const features = [
  "Video HD tanpa batas waktu",
  "100+ peserta per sesi",
  "Notulen AI otomatis (Bahasa Indonesia)",
  "Absensi otomatis via LiveKit",
  "Caption live bahasa Indonesia + Inggris",
  "Kuis AI untuk dosen",
  "Rekaman cloud (Supabase Storage)",
  "Papan tulis kolaboratif (tldraw)",
  "Ruang breakout",
  "Polling & tanya jawab anonim",
  "Latar belakang virtual",
  "Export kehadiran ke CSV/PDF",
  "Dukungan semua browser",
  "Tidak perlu install apapun",
];

export function Pricing() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Satu Harga untuk Semua
          </h2>
          <p className="text-gray-400 text-lg">Gratis selamanya. Tidak ada kartu kredit.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-8 md:p-12 rounded-3xl border border-blue-500/30 overflow-hidden"
          style={{ background: "linear-gradient(145deg, rgba(37,99,235,0.08), rgba(16,185,129,0.04))" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-7xl font-bold text-white">Rp 0</span>
              <span className="text-gray-400 text-lg">/bulan</span>
            </div>
            <p className="text-emerald-400 font-semibold text-lg mb-10">
              Gratis Selamanya — Semua Fitur Termasuk
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
              >
                Daftar Gratis Sekarang
              </a>
              <p className="text-gray-500 text-sm mt-3">Tidak perlu kartu kredit. Tidak perlu install.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
