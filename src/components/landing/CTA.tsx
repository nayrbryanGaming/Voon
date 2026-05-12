"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 px-4 bg-[#0F172A]">
      <div className="container mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">
            Kampus Anda Butuh Voon Sekarang
          </h2>
          <p className="text-gray-400 text-xl mb-10">
            Bergabunglah dengan ribuan mahasiswa dan dosen yang sudah menggunakan Voon.
          </p>
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold text-xl transition-all duration-200 hover:shadow-[0_0_50px_rgba(37,99,235,0.5)]"
          >
            Mulai Gratis
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
