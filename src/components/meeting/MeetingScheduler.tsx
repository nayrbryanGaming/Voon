"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Calendar, Clock, FileText, Users, Globe } from "lucide-react";

const schema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Waktu mulai wajib diisi"),
  maxParticipants: z.number().min(2).max(500).optional(),
  isPublic: z.boolean().default(false),
  isRecorded: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export function MeetingScheduler() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
      isPublic: false,
      isRecorded: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Gagal membuat meeting");
      const meeting = await res.json();
      toast.success("Meeting berhasil dibuat!");
      router.push(`/meetings/${meeting.id}`);
    } catch {
      toast.error("Gagal membuat meeting. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          Judul Meeting *
        </label>
        <input
          {...register("title")}
          type="text"
          placeholder="Cth: Kuliah IF302 Pertemuan 5"
          className="w-full px-4 py-3 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Deskripsi (opsional)</label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Topik yang akan dibahas..."
          className="w-full px-4 py-3 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
        />
      </div>

      {/* Start time */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          Waktu Mulai *
        </label>
        <input
          {...register("startTime")}
          type="datetime-local"
          className="w-full px-4 py-3 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        {errors.startTime && <p className="text-red-400 text-xs mt-1">{errors.startTime.message}</p>}
      </div>

      {/* Max participants */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Users className="w-4 h-4 inline mr-2" />
          Maks Peserta (opsional)
        </label>
        <input
          {...register("maxParticipants", { valueAsNumber: true })}
          type="number"
          min={2}
          max={500}
          placeholder="Tidak terbatas"
          className="w-full px-4 py-3 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            {...register("isPublic")}
            type="checkbox"
            className="w-4 h-4 rounded border-white/20 bg-[var(--voon-bg-elevated)] accent-blue-600"
          />
          <div>
            <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              Meeting Publik
            </span>
            <p className="text-xs text-gray-500">Siapa saja dengan link bisa bergabung</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            {...register("isRecorded")}
            type="checkbox"
            className="w-4 h-4 rounded border-white/20 bg-[var(--voon-bg-elevated)] accent-blue-600"
          />
          <div>
            <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Rekam Otomatis
            </span>
            <p className="text-xs text-gray-500">Rekaman disimpan ke cloud</p>
          </div>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl font-semibold transition-colors"
      >
        {loading ? "Membuat Meeting..." : "Buat Meeting"}
      </button>
    </form>
  );
}
