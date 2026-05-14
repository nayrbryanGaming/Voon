"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Copy, Video, VideoOff, Mic, MicOff, Users, Calendar, Check, AlertCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { getMeetingInviteUrl } from "@/lib/meeting-utils";

interface MeetingLobbyProps {
  meeting: {
    id: string;
    title: string;
    description: string | null;
    startTime: Date;
    roomId: string;
    inviteCode: string;
    status: string;
    host: { name: string; avatarUrl: string | null };
    _count: { participants: number };
  };
}

export function MeetingLobby({ meeting }: MeetingLobbyProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [camError, setCamError] = useState<string | null>(null);

  const inviteUrl = getMeetingInviteUrl(meeting.inviteCode);

  useEffect(() => {
    let localStream: MediaStream | null = null;
    if (camOn) {
      setCamError(null);
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((s) => {
          localStream = s;
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch((err: unknown) => {
          const name = err instanceof DOMException ? err.name : "";
          if (name === "NotAllowedError" || name === "PermissionDeniedError") {
            setCamError("Izin kamera ditolak. Aktifkan kamera di pengaturan browser.");
          } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
            setCamError("Tidak ada kamera yang terdeteksi.");
          } else {
            setCamError("Kamera tidak dapat diakses.");
          }
          setCamOn(false);
        });
    } else {
      setStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop());
        return null;
      });
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camOn]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Link disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = () => {
    stream?.getTracks().forEach((t) => t.stop());
    router.push(`/room/${meeting.roomId}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camera preview */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-4">Pratinjau Kamera</h2>
          <div className="relative aspect-video bg-[var(--voon-bg-elevated)] rounded-2xl overflow-hidden border border-white/10">
            {camOn ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                <VideoOff className="w-12 h-12 text-gray-600" />
                {camError && (
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {camError}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setMicOn(!micOn)}
              className={`p-3 rounded-xl transition-colors ${micOn ? "bg-white/10 text-white" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
              title={micOn ? "Matikan Mic" : "Aktifkan Mic"}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => setCamOn(!camOn)}
              className={`p-3 rounded-xl transition-colors ${camOn ? "bg-white/10 text-white" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
              title={camOn ? "Matikan Kamera" : "Aktifkan Kamera"}
            >
              {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Meeting info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{meeting.title}</h1>
            {meeting.description && <p className="text-gray-400 text-sm">{meeting.description}</p>}
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Calendar className="w-4 h-4" />
                {formatDateTime(meeting.startTime)}
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Users className="w-4 h-4" />
                Host: {meeting.host.name}
              </div>
            </div>
          </div>

          {/* Invite link */}
          <div>
            <label htmlFor="invite-url" className="block text-sm font-medium text-gray-300 mb-2">
              Link Undangan
            </label>
            <div className="flex gap-2">
              <input
                id="invite-url"
                readOnly
                value={inviteUrl}
                aria-label="Link undangan meeting"
                className="flex-1 px-3 py-2 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-xl text-gray-300 text-sm"
              />
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Salin link undangan"
                className="p-2 bg-[var(--voon-bg-elevated)] border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl">
              <QRCodeSVG value={inviteUrl} size={80} />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Kode: {meeting.inviteCode}</p>
              <p className="text-gray-500 text-xs mt-1">Scan QR atau masukkan kode untuk bergabung</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleJoin}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
          >
            Masuk ke Meeting
          </button>
        </div>
      </div>
    </div>
  );
}
