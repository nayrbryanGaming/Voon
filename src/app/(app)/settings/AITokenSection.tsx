"use client";

import { useState } from "react";
import { Zap, Eye, EyeOff, Trash2, Save, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface AITokenSectionProps {
  initialHasToken: boolean;
  initialTier: string;
}

export function AITokenSection({ initialHasToken, initialTier }: AITokenSectionProps) {
  const [hasToken, setHasToken] = useState(initialHasToken);
  const [tier, setTier] = useState(initialTier);
  const [tokenInput, setTokenInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [maskedDisplay, setMaskedDisplay] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  const fetchMasked = async () => {
    const res = await fetch("/api/user/token");
    if (res.ok) {
      const data = await res.json() as { hasToken: boolean; masked: string | null; provider: string | null; tier?: string | null };
      setMaskedDisplay(data.masked);
      setProvider(data.provider);
    }
  };

  const handleSave = async () => {
    if (!tokenInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan token");
      setHasToken(true);
      setTier("PREMIUM");
      setTokenInput("");
      setShowInput(false);
      await fetchMasked();
      toast.success("Token AI disimpan dengan enkripsi AES-256 · Akun diupgrade ke Premium");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Hapus token AI? Akun akan kembali ke Free tier.")) return;
    setLoading(true);
    try {
      await fetch("/api/user/token", { method: "DELETE" });
      setHasToken(false);
      setTier("FREE");
      setMaskedDisplay(null);
      setProvider(null);
      toast.success("Token dihapus · Kembali ke Free tier");
    } catch {
      toast.error("Gagal menghapus token");
    } finally {
      setLoading(false);
    }
  };

  const providerLabel: Record<string, string> = {
    groq: "Groq (Llama 3.1)",
    anthropic: "Anthropic (Claude)",
    openai: "OpenAI compat",
  };

  return (
    <div className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5">
      <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-400" />
        Token AI Agent
        {tier === "PREMIUM" && (
          <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">Premium</span>
        )}
      </h2>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Daftarkan token API Groq (gratis: console.groq.com) atau Anthropic Claude (premium) untuk fitur AI yang lebih baik.
        Token dienkripsi AES-256-GCM sebelum disimpan — tidak ada yang bisa membacanya selain Anda.
      </p>

      {hasToken ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-emerald-300 font-medium">Token tersimpan</p>
              {maskedDisplay ? (
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  {provider ? `${providerLabel[provider] ?? provider} · ` : ""}
                  {showToken ? maskedDisplay : "••••••••••••••••"}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={fetchMasked}
                  className="text-xs text-gray-500 underline mt-0.5"
                >
                  Lihat detail
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              className="text-gray-500 hover:text-gray-300 transition-colors p-1"
              title={showToken ? "Sembunyikan" : "Tampilkan"}
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowInput((v) => !v)}
              className="flex-1 text-xs py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 transition-colors"
            >
              Ganti Token
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-1 text-xs py-2 px-3 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowInput(true)}
          className="w-full py-2.5 text-sm rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 transition-colors"
        >
          + Tambah Token AI
        </button>
      )}

      {showInput && (
        <div className="mt-3 space-y-2">
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Groq (gratis): <span className="font-mono text-gray-400">gsk_...</span> — console.groq.com/keys</p>
            <p>• Anthropic Claude: <span className="font-mono text-gray-400">sk-ant-...</span> — console.anthropic.com</p>
          </div>
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste token API di sini..."
              autoComplete="off"
              spellCheck={false}
              className="w-full px-3 py-2.5 pr-10 bg-[var(--voon-bg)] border border-white/10 rounded-xl text-sm text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
            />
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || !tokenInput.trim()}
              className="flex items-center gap-1.5 flex-1 justify-center py-2.5 text-sm rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? "Menyimpan..." : "Simpan & Enkripsi"}
            </button>
            <button
              type="button"
              onClick={() => { setShowInput(false); setTokenInput(""); }}
              className="py-2.5 px-4 text-sm rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
