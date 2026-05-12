"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[var(--voon-gradient-hero)]" />
      <div className="absolute inset-0" style={{ background: "var(--voon-gradient-glow)" }} />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 rounded-full bg-blue-500/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              "--duration": `${4 + Math.random() * 6}s`,
              "--delay": `${Math.random() * 4}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm mb-8"
        >
          <span className="live-dot w-2 h-2 rounded-full bg-blue-400 inline-block" />
          100% Gratis untuk Kampus Indonesia
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight"
        >
          Meet at the{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Speed of Voice
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto"
        >
          Free. Unlimited. Built for campus.
          <br />
          <span className="text-gray-500 text-lg">
            Video conference dengan AI — notulen, absensi, & kuis otomatis.
          </span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
          >
            Mulai Meeting
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/meetings/new"
            className="flex items-center gap-2 px-8 py-4 border border-white/20 hover:border-white/40 text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-white/5"
          >
            <Play className="w-5 h-5" />
            Jadwalkan Kuliah
          </Link>
        </motion.div>

        {/* Waveform decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex items-end justify-center gap-1 mt-16 h-16"
        >
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className="waveform-bar w-1.5 rounded-full bg-gradient-to-t from-blue-600 to-blue-400"
              style={{
                height: `${20 + Math.sin(i * 0.4) * 30 + 20}%`,
                "--duration": `${0.8 + Math.random() * 0.8}s`,
                "--delay": `${i * 0.05}s`,
              } as React.CSSProperties}
            />
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap justify-center gap-8 mt-12 text-center"
        >
          {[
            { label: "Batas Waktu", value: "∞" },
            { label: "Peserta", value: "100+" },
            { label: "Biaya", value: "Rp 0" },
            { label: "Install", value: "Tidak Perlu" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
