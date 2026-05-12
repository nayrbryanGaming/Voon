"use client";

import { motion } from "framer-motion";
import { Plus, Link, Video } from "lucide-react";

const steps = [
  {
    icon: Plus,
    step: "01",
    title: "Buat Meeting",
    description: "Klik 'Mulai Meeting' atau jadwalkan kuliah dengan judul, waktu, dan peserta.",
  },
  {
    icon: Link,
    step: "02",
    title: "Bagikan Link",
    description: "Salin link undangan atau QR code — peserta bergabung langsung dari browser.",
  },
  {
    icon: Video,
    step: "03",
    title: "Meet & Biarkan AI Bekerja",
    description: "Setelah selesai, Voon otomatis menghasilkan notulen, absensi, dan action items.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-[#0F172A]">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Cara Kerjanya</h2>
          <p className="text-gray-400 text-lg">Tiga langkah mudah, tidak perlu install apapun.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6 relative">
                  <Icon className="w-10 h-10 text-blue-400" />
                  <span className="absolute -top-2 -right-2 text-xs font-mono text-blue-400 bg-blue-500/20 border border-blue-500/30 rounded-full w-6 h-6 flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-xl mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
