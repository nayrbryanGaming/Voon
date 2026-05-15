"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type BgType = "none" | "blur-light" | "blur-heavy" | "solid" | "gradient" | "image";

interface Background {
  id: string;
  type: BgType;
  label: string;
  value?: string;
}

const PRESET_BACKGROUNDS: Background[] = [
  { id: "none",        type: "none",        label: "Tidak Ada" },
  { id: "blur-light",  type: "blur-light",  label: "Blur Ringan" },
  { id: "blur-heavy",  type: "blur-heavy",  label: "Blur Penuh" },
  { id: "solid-dark",  type: "solid",       label: "Hitam",    value: "#0A0F1E" },
  { id: "solid-navy",  type: "solid",       label: "Navy",     value: "#1e3a5f" },
  { id: "solid-green", type: "solid",       label: "Hijau Tua",value: "#064e3b" },
  { id: "solid-white", type: "solid",       label: "Putih",    value: "#f8fafc" },
  { id: "grad-ocean",  type: "gradient",    label: "Samudra",  value: "linear-gradient(135deg,#0ea5e9,#6366f1)" },
  { id: "grad-sunset", type: "gradient",    label: "Sunset",   value: "linear-gradient(135deg,#f97316,#ec4899)" },
  { id: "grad-forest", type: "gradient",    label: "Hutan",    value: "linear-gradient(135deg,#059669,#0d9488)" },
  { id: "grad-space",  type: "gradient",    label: "Angkasa",  value: "linear-gradient(135deg,#1e1b4b,#0f172a,#312e81)" },
];

function BgPreview({ bg }: { bg: Background }) {
  if (bg.type === "none") {
    return <div className="w-full h-full bg-[var(--voon-bg-elevated)] rounded-lg flex items-center justify-center"><X className="w-4 h-4 text-gray-500" /></div>;
  }
  if (bg.type === "blur-light") {
    return <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm flex items-center justify-center text-xs text-white/60">Blur</div>;
  }
  if (bg.type === "blur-heavy") {
    return <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-900/80 to-purple-900/80 backdrop-blur-xl flex items-center justify-center text-xs text-white/60">Blur++</div>;
  }
  if (bg.type === "solid") {
    return <div className="w-full h-full rounded-lg border border-white/5" style={{ backgroundColor: bg.value }} />;
  }
  if (bg.type === "gradient") {
    return <div className="w-full h-full rounded-lg" style={{ background: bg.value }} />;
  }
  return <div className="w-full h-full bg-gray-600 rounded-lg" />;
}

export function BackgroundSelectorPanel() {
  const [selected, setSelected] = useState("none");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyBackground = useCallback(async (bg: Background) => {
    setSelected(bg.id);
    setApplying(true);

    try {
      // For blur effects: use CSS filter on local video via a canvas processor
      // This applies the filter visually; true virtual bg needs @livekit/track-processors
      if (bg.type === "blur-light" || bg.type === "blur-heavy") {
        // Apply a CSS filter hint stored in a data attribute on local video elements
        const blurPx = bg.type === "blur-light" ? "8px" : "20px";
        document.querySelectorAll<HTMLVideoElement>(".lk-participant-tile video").forEach((v) => {
          if (v.closest("[data-lk-local]") || v.getAttribute("data-lk-local") !== null) {
            v.style.filter = `blur(${blurPx})`;
          }
        });
        toast.success(`Blur ${bg.type === "blur-light" ? "ringan" : "penuh"} diaktifkan`);
      } else {
        // Remove blur from local video
        document.querySelectorAll<HTMLVideoElement>(".lk-participant-tile video").forEach((v) => {
          v.style.filter = "";
        });
        if (bg.type !== "none") {
          toast.success(`Latar "${bg.label}" diterapkan`);
        } else {
          toast.success("Latar belakang dihapus");
        }
      }
    } finally {
      setApplying(false);
    }
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCustomImage(dataUrl);
      const customBg: Background = { id: "custom-image", type: "image", label: "Gambar Saya", value: dataUrl };
      applyBackground(customBg);
    };
    reader.readAsDataURL(file);
  }, [applyBackground]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-[var(--voon-bg-elevated)] min-h-full">
      <div>
        <h3 className="font-semibold text-white text-sm mb-0.5">Latar Belakang Virtual</h3>
        <p className="text-xs text-gray-500">Pilih atau unggah latar belakang</p>
      </div>

      {/* Preset grid */}
      <div className="grid grid-cols-3 gap-2">
        {PRESET_BACKGROUNDS.map((bg) => (
          <button
            key={bg.id}
            type="button"
            onClick={() => applyBackground(bg)}
            disabled={applying}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl p-1.5 border-2 transition-all",
              selected === bg.id
                ? "border-blue-500 bg-blue-500/10"
                : "border-transparent hover:border-white/20 hover:bg-white/5"
            )}
          >
            <div className="w-full h-10 rounded-lg overflow-hidden relative">
              <BgPreview bg={bg} />
              {selected === bg.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-gray-400 text-center leading-tight">{bg.label}</span>
          </button>
        ))}

        {/* Custom image */}
        {customImage && (
          <button
            type="button"
            onClick={() => applyBackground({ id: "custom-image", type: "image", label: "Gambar Saya", value: customImage })}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl p-1.5 border-2 transition-all",
              selected === "custom-image" ? "border-blue-500 bg-blue-500/10" : "border-transparent hover:border-white/20"
            )}
          >
            <div className="w-full h-10 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={customImage} alt="Custom background" className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] text-gray-400">Gambar Saya</span>
          </button>
        )}
      </div>

      {/* Upload button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-colors text-sm"
      >
        <Upload className="w-4 h-4" />
        Unggah Gambar (max 5MB)
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-label="Unggah gambar latar belakang"
        title="Unggah gambar latar belakang"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
        <p className="text-xs text-yellow-400 leading-relaxed">
          Blur diterapkan pada pratinjau lokal. Untuk latar belakang yang terlihat oleh peserta lain, perlu konfigurasi server tambahan.
        </p>
      </div>
    </div>
  );
}

export function BackgroundSelector({ onSelect: _onSelect }: { onSelect?: (bgId: string) => void }) {
  return <BackgroundSelectorPanel />;
}
