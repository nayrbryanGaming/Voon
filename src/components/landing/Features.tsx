"use client";

import { motion } from "framer-motion";
import { Video, Brain, Users, PenTool, Circle, Subtitles } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Video HD Unlimited",
    description: "Tidak ada batas waktu atau peserta. WebRTC berkualitas Zoom via LiveKit.",
    color: "blue",
  },
  {
    icon: Brain,
    title: "Notulen AI Otomatis",
    description: "Claude AI merangkum setiap pertemuan — poin penting, action items, dan topik.",
    color: "emerald",
  },
  {
    icon: Users,
    title: "Absensi Cerdas",
    description: "Otomatis mencatat kehadiran dari waktu masuk dan keluar peserta.",
    color: "amber",
  },
  {
    icon: PenTool,
    title: "Papan Tulis Kolaboratif",
    description: "tldraw terintegrasi — gambar, tulis, dan kolaborasi secara real-time.",
    color: "purple",
  },
  {
    icon: Circle,
    title: "Rekaman Cloud",
    description: "Rekam dan simpan ke Supabase Storage. Putar ulang kapan saja.",
    color: "red",
  },
  {
    icon: Subtitles,
    title: "Caption Live AI",
    description: "Caption otomatis dalam Bahasa Indonesia dan Inggris via Web Speech API + Claude.",
    color: "cyan",
  },
];

const colorMap = {
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export function Features() {
  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Semua yang Anda Butuhkan
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Dirancang khusus untuk kebutuhan akademik — kuliah, sidang, rapat dosen, semua ada.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const colorClass = colorMap[feature.color as keyof typeof colorMap];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-6 rounded-2xl border border-white/5 bg-[var(--voon-bg-card)] hover:border-white/10 transition-all duration-300 group grain-overlay overflow-hidden"
                style={{ background: "var(--voon-gradient-card)" }}
              >
                <div className={`inline-flex p-3 rounded-xl border mb-4 ${colorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24"
        >
          <h3 className="font-serif text-3xl text-white text-center mb-12">Kenapa Voon?</h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left p-4 text-gray-400">Fitur</th>
                  <th className="p-4 text-blue-400 font-bold">Voon</th>
                  <th className="p-4 text-gray-500">Zoom Free</th>
                  <th className="p-4 text-gray-500">Google Meet</th>
                  <th className="p-4 text-gray-500">Teams</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Batas Waktu", "♾️ Unlimited", "40 menit", "60 menit", "60 menit"],
                  ["Peserta", "100+", "100", "100", "100"],
                  ["Install App", "❌ Tidak", "✅ Perlu", "❌ Tidak", "✅ Perlu"],
                  ["Notulen AI", "✅ Otomatis", "❌ Berbayar", "❌ Berbayar", "❌ Berbayar"],
                  ["Absensi AI", "✅", "❌", "❌", "❌"],
                  ["Kuis AI", "✅", "❌", "❌", "❌"],
                  ["Caption Indonesia", "✅", "⚠️ Terbatas", "⚠️ Terbatas", "⚠️"],
                  ["Harga", "GRATIS", "Freemium", "Freemium", "Freemium"],
                ].map(([feature, ...vals]) => (
                  <tr key={feature} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="p-4 text-gray-300">{feature}</td>
                    <td className="p-4 text-center font-semibold text-blue-400">{vals[0]}</td>
                    {vals.slice(1).map((v, i) => (
                      <td key={i} className="p-4 text-center text-gray-500">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
