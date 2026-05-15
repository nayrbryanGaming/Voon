"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface InvitePanelProps {
  meetingId: string;
  meetingTitle: string;
  inviteCode: string;
  roomId: string;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} disalin`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex-shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
      title={`Salin ${label}`}
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export function InvitePanel({ meetingId, meetingTitle, inviteCode, roomId }: InvitePanelProps) {
  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/room/${roomId}`
      : `https://voon.vercel.app/room/${roomId}`;

  const whatsappText = encodeURIComponent(
    `Bergabung ke meeting "${meetingTitle}"!\n\nKode: ${inviteCode}\nLink: ${inviteLink}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  return (
    <div className="flex flex-col gap-4 p-4 bg-[var(--voon-bg-elevated)] min-h-full">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-white text-sm mb-1">Undang Peserta</h3>
        <p className="text-xs text-gray-500">Bagikan kode atau link berikut</p>
      </div>

      {/* Meeting title */}
      <div className="rounded-xl border border-white/10 bg-[var(--voon-bg-card)] p-3">
        <p className="text-xs text-gray-500 mb-1">Meeting</p>
        <p className="text-sm text-white font-medium truncate">{meetingTitle}</p>
      </div>

      {/* Invite code */}
      <div className="rounded-xl border border-white/10 bg-[var(--voon-bg-card)] p-3">
        <p className="text-xs text-gray-500 mb-2">Kode Undangan</p>
        <div className="flex items-center gap-2">
          <span className="flex-1 font-mono text-xl font-bold text-blue-400 tracking-widest">
            {inviteCode}
          </span>
          <CopyButton text={inviteCode} label="Kode" />
        </div>
      </div>

      {/* Invite link */}
      <div className="rounded-xl border border-white/10 bg-[var(--voon-bg-card)] p-3">
        <p className="text-xs text-gray-500 mb-2">Link Undangan</p>
        <div className="flex items-center gap-2">
          <span className="flex-1 text-xs text-gray-300 break-all leading-relaxed">
            {inviteLink}
          </span>
          <CopyButton text={inviteLink} label="Link" />
        </div>
      </div>

      {/* QR Code */}
      <div className="rounded-xl border border-white/10 bg-[var(--voon-bg-card)] p-4 flex flex-col items-center gap-3">
        <p className="text-xs text-gray-500">Scan QR Code</p>
        <div className="p-3 bg-white rounded-xl">
          <QRCodeSVG
            value={inviteLink}
            size={160}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
          />
        </div>
        <p className="text-xs text-gray-600 text-center">
          Scan dengan kamera HP untuk bergabung
        </p>
      </div>

      {/* WhatsApp share */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        Bagikan ke WhatsApp
      </a>
    </div>
  );
}
