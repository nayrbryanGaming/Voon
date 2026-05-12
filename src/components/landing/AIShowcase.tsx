"use client";

import { motion } from "framer-motion";
import { Brain, CheckSquare, Zap, FileText } from "lucide-react";

const DEMO_SUMMARY = {
  title: "Kuliah Algoritma & Pemrograman — Pertemuan 12",
  duration: "1 jam 23 menit · 27 peserta",
  summary:
    "Pertemuan membahas algoritma sorting: bubble sort, merge sort, dan quick sort. Mahasiswa berhasil memahami kompleksitas waktu O(n²) vs O(n log n) melalui demonstrasi langsung. Diskusi interaktif menunjukkan antusiasme tinggi.",
  keyPoints: [
    "Bubble sort: O(n²) — cocok data kecil",
    "Merge sort: O(n log n) — stabil, ideal produksi",
    "Quick sort: O(n log n) rata-rata, paling cepat praktis",
    "In-place vs out-of-place: trade-off memori",
  ],
  actionItems: [
    "Kerjakan soal latihan sorting di LMS (semua mahasiswa)",
    "Buat video penjelasan merge sort (Ahmad, Rini — minggu depan)",
    "Upload materi slides ke grup (Dosen — hari ini)",
  ],
  sentiment: "productive",
};

export function AIShowcase() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm mb-6">
            <Brain className="w-4 h-4" />
            Powered by Claude AI
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            AI yang Bekerja untuk Anda
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Setiap meeting menghasilkan notulen, action items, dan ringkasan otomatis — tanpa harus mengetik satu kata pun.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: feature list */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              {
                icon: Brain,
                color: "purple",
                title: "Notulen Otomatis",
                desc: "Transkrip diproses Claude AI — ringkasan 2-3 paragraf dalam Bahasa Indonesia langsung setelah meeting selesai.",
              },
              {
                icon: CheckSquare,
                color: "emerald",
                title: "Action Items Terdeteksi",
                desc: "AI mengidentifikasi tugas, penanggung jawab, dan tenggat waktu dari percakapan — zero effort dari dosen.",
              },
              {
                icon: Zap,
                color: "amber",
                title: "Kuis AI Instan",
                desc: "Tekan satu tombol → 5 soal pilihan ganda dari materi kuliah yang sedang berjalan. Ideal untuk evaluasi dadakan.",
              },
              {
                icon: FileText,
                color: "blue",
                title: "Transkrip Lengkap",
                desc: "Setiap kata yang diucapkan tersimpan dan bisa di-download. Caption live dalam Bahasa Indonesia tersedia real-time.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              const colors: Record<string, string> = {
                purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
              };
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${colors[item.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right: animated AI summary card demo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl" />

            <div className="relative p-6 rounded-2xl border border-white/10 bg-[var(--voon-bg-card)] space-y-5 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{DEMO_SUMMARY.title}</p>
                  <p className="text-gray-500 text-xs">{DEMO_SUMMARY.duration}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  productive
                </span>
              </div>

              {/* Summary */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ringkasan AI</p>
                <p className="text-gray-300 text-sm leading-relaxed">{DEMO_SUMMARY.summary}</p>
              </div>

              {/* Key points */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Poin Utama</p>
                <ul className="space-y-1.5">
                  {DEMO_SUMMARY.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action items */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Action Items</p>
                <ul className="space-y-1.5">
                  {DEMO_SUMMARY.actionItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckSquare className="flex-shrink-0 w-4 h-4 text-emerald-400 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Typing cursor animation */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-blue-400"
                      style={{ animation: `live-pulse 1.5s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">Dihasilkan oleh Claude AI dalam 4 detik</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
