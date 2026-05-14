"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Calendar, Clock, FileText, Users, Globe, BookOpen, GraduationCap, Briefcase, UserCheck } from "lucide-react";

const schema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Waktu mulai wajib diisi"),
  maxParticipants: z.number().min(2).max(500).optional(),
  isPublic: z.boolean().default(false),
  isRecorded: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

const MEETING_TEMPLATES = [
  {
    id: "kuliah",
    label: "Kuliah",
    icon: BookOpen,
    color: "blue",
    defaults: {
      title: "Kuliah — ",
      description: "Perkuliahan reguler. Materi dan topik akan dibahas bersama.",
      isPublic: false,
      isRecorded: true,
      maxParticipants: 100,
    },
  },
  {
    id: "sidang",
    label: "Sidang Skripsi",
    icon: GraduationCap,
    color: "purple",
    defaults: {
      title: "Sidang Skripsi — ",
      description: "Sesi sidang tugas akhir/skripsi. Mohon hadir tepat waktu.",
      isPublic: false,
      isRecorded: true,
      maxParticipants: 20,
    },
  },
  {
    id: "rapat",
    label: "Rapat",
    icon: Briefcase,
    color: "amber",
    defaults: {
      title: "Rapat — ",
      description: "Rapat koordinasi. Agenda akan disampaikan sebelum sesi dimulai.",
      isPublic: false,
      isRecorded: false,
      maxParticipants: 50,
    },
  },
  {
    id: "konsultasi",
    label: "Konsultasi",
    icon: UserCheck,
    color: "emerald",
    defaults: {
      title: "Konsultasi — ",
      description: "Sesi konsultasi bimbingan. Siapkan pertanyaan dan bahan yang akan dibahas.",
      isPublic: false,
      isRecorded: false,
      maxParticipants: 5,
    },
  },
] as const;

const COLOR_MAP: Record<string, string> = {
  blue: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  purple: "border-purple-500/40 bg-purple-500/10 text-purple-400",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
};

interface MeetingSchedulerProps {
  instant?: boolean;
}

export function MeetingScheduler({ instant = false }: MeetingSchedulerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: instant ? "Meeting Instan" : "",
      startTime: new Date().toISOString().slice(0, 16),
      isPublic: false,
      isRecorded: false,
    },
  });

  useEffect(() => {
    if (instant) {
      const submit = async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/meetings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Meeting Instan",
              startTime: new Date().toISOString(),
              isPublic: false,
              isRecorded: false,
            }),
          });
          if (!res.ok) throw new Error("Gagal membuat meeting");
          const meeting = await res.json();
          toast.success("Meeting instan dimulai!");
          router.push(`/meetings/${meeting.id}`);
        } catch {
          toast.error("Gagal membuat meeting instan. Coba lagi.");
          setLoading(false);
        }
      };
      submit();
    }
  }, [instant, router]);

  const applyTemplate = (tpl: (typeof MEETING_TEMPLATES)[number]) => {
    setActiveTemplate(tpl.id);
    setValue("title", tpl.defaults.title);
    setValue("description", tpl.defaults.description);
    setValue("isPublic", tpl.defaults.isPublic);
    setValue("isRecorded", tpl.defaults.isRecorded);
    if (tpl.defaults.maxParticipants) setValue("maxParticipants", tpl.defaults.maxParticipants);
  };

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
      {/* Meeting Templates */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Template Cepat</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MEETING_TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            const isActive = activeTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                  isActive
                    ? COLOR_MAP[tpl.color] + " border-opacity-80"
                    : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tpl.label}
              </button>
            );
          })}
        </div>
      </div>

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
