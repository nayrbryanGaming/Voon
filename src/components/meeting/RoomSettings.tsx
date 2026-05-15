"use client";

import { useState, useEffect, useCallback } from "react";
import { useParticipants, useRoomContext } from "@livekit/components-react";
import {
  MicOff, Lock, Unlock, Users, PhoneOff, Mic, Video, Speaker,
  ChevronDown, Zap, ZapOff, MessageSquare, Monitor, Image,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { VideoPresets } from "livekit-client";
import { NoiseToggle } from "./NoiseToggle";

interface RoomSettingsProps {
  isHost: boolean;
  meetingId: string;
  micLocked?: boolean;
  camLocked?: boolean;
  chatLocked?: boolean;
  screenShareLocked?: boolean;
  mediaAllowed?: boolean;
}

type DeviceInfo = { deviceId: string; label: string };
type VideoQuality = "low" | "medium" | "high" | "hd";

const VIDEO_QUALITY: Record<VideoQuality, { label: string; resolution: { width: number; height: number } }> = {
  low:    { label: "Rendah (180p)",   resolution: VideoPresets.h90.resolution },
  medium: { label: "Sedang (360p)",   resolution: VideoPresets.h360.resolution },
  high:   { label: "Tinggi (540p)",   resolution: VideoPresets.h540.resolution },
  hd:     { label: "HD (720p)",       resolution: VideoPresets.h720.resolution },
};

function DeviceSelect({ kind, label, icon: Icon, devices, selectedId, onChange }: {
  kind: string; label: string; icon: React.ElementType;
  devices: DeviceInfo[]; selectedId: string; onChange: (id: string) => void;
}) {
  if (devices.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-gray-500 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" />{label}</p>
      <div className="relative">
        <select
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          title={label}
          className="w-full appearance-none bg-[var(--voon-bg)] border border-white/10 rounded-xl px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `${label} ${d.deviceId.slice(0, 8)}`}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}

function PermissionToggle({
  label, icon: Icon, locked, onToggle, disabled,
}: { label: string; icon: React.ElementType; locked: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onToggle} disabled={disabled}
      className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-[var(--voon-bg-card)] border border-white/10 hover:border-white/20 transition-colors disabled:opacity-50">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 flex-shrink-0 ${locked ? "text-orange-400" : "text-gray-400"}`} />
        <span className="text-sm text-white">{label}</span>
      </div>
      <div className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${locked ? "bg-orange-500" : "bg-white/20"}`}>
        <div className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform shadow ${locked ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
    </button>
  );
}

export function RoomSettings({ isHost, meetingId, micLocked: initialMicLocked = false, camLocked: initialCamLocked = false, chatLocked: initialChatLocked = false, screenShareLocked: initialScreenShareLocked = false, mediaAllowed: initialMediaAllowed = true }: RoomSettingsProps) {
  const room = useRoomContext();
  const participants = useParticipants();
  const router = useRouter();

  const [locked, setLocked] = useState(false);
  const [endingMeeting, setEndingMeeting] = useState(false);

  const [micLocked, setMicLocked] = useState(initialMicLocked);
  const [camLocked, setCamLocked] = useState(initialCamLocked);
  const [chatLocked, setChatLocked] = useState(initialChatLocked);
  const [screenShareLocked, setScreenShareLocked] = useState(initialScreenShareLocked);
  const [mediaAllowed, setMediaAllowed] = useState(initialMediaAllowed);

  const [videoQuality, setVideoQuality] = useState<VideoQuality>("medium");
  const [perfMode, setPerfMode] = useState(false);

  const [micDevices, setMicDevices]   = useState<DeviceInfo[]>([]);
  const [camDevices, setCamDevices]   = useState<DeviceInfo[]>([]);
  const [spkDevices, setSpkDevices]   = useState<DeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedCam, setSelectedCam] = useState("");
  const [selectedSpk, setSelectedSpk] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).catch(() => {});
        const all = await navigator.mediaDevices.enumerateDevices();
        setMicDevices(all.filter(d => d.kind === "audioinput").map(d => ({ deviceId: d.deviceId, label: d.label })));
        setCamDevices(all.filter(d => d.kind === "videoinput").map(d => ({ deviceId: d.deviceId, label: d.label })));
        setSpkDevices(all.filter(d => d.kind === "audiooutput").map(d => ({ deviceId: d.deviceId, label: d.label })));
      } catch { /* permission denied */ }
    };
    load();
  }, []);

  const handleMicChange = useCallback(async (id: string) => {
    setSelectedMic(id);
    try { await room.switchActiveDevice("audioinput", id); toast.success("Mikrofon diubah"); }
    catch { toast.error("Gagal mengubah mikrofon"); }
  }, [room]);

  const handleCamChange = useCallback(async (id: string) => {
    setSelectedCam(id);
    try { await room.switchActiveDevice("videoinput", id); toast.success("Kamera diubah"); }
    catch { toast.error("Gagal mengubah kamera"); }
  }, [room]);

  const handleSpkChange = useCallback(async (id: string) => {
    setSelectedSpk(id);
    try { await room.switchActiveDevice("audiooutput", id); toast.success("Speaker diubah"); }
    catch { toast.error("Gagal mengubah speaker"); }
  }, [room]);

  const handleVideoQuality = useCallback(async (q: VideoQuality) => {
    setVideoQuality(q);
    try {
      const res = VIDEO_QUALITY[q].resolution;
      await room.localParticipant?.setCameraEnabled(true, { resolution: res });
      toast.success(`Kualitas video: ${VIDEO_QUALITY[q].label}`);
    } catch { toast.error("Gagal mengubah kualitas video"); }
  }, [room]);

  const broadcastPermissions = useCallback((
    mic: boolean, cam: boolean, chat: boolean, screenShare: boolean, media: boolean
  ) => {
    room.localParticipant?.publishData(
      new TextEncoder().encode(JSON.stringify({
        type: "room-permissions",
        micLocked: mic,
        camLocked: cam,
        chatLocked: chat,
        screenShareLocked: screenShare,
        mediaAllowed: media,
      }))
    );
  }, [room]);

  const toggleMicLock = useCallback(() => {
    const next = !micLocked;
    setMicLocked(next);
    broadcastPermissions(next, camLocked, chatLocked, screenShareLocked, mediaAllowed);
    toast.success(next ? "Mic semua peserta dikunci" : "Mic diizinkan");
  }, [micLocked, camLocked, chatLocked, screenShareLocked, mediaAllowed, broadcastPermissions]);

  const toggleCamLock = useCallback(() => {
    const next = !camLocked;
    setCamLocked(next);
    broadcastPermissions(micLocked, next, chatLocked, screenShareLocked, mediaAllowed);
    toast.success(next ? "Kamera semua peserta dikunci" : "Kamera diizinkan");
  }, [micLocked, camLocked, chatLocked, screenShareLocked, mediaAllowed, broadcastPermissions]);

  const toggleChatLock = useCallback(() => {
    const next = !chatLocked;
    setChatLocked(next);
    broadcastPermissions(micLocked, camLocked, next, screenShareLocked, mediaAllowed);
    toast.success(next ? "Chat dikunci" : "Chat diizinkan");
  }, [micLocked, camLocked, chatLocked, screenShareLocked, mediaAllowed, broadcastPermissions]);

  const toggleScreenShareLock = useCallback(() => {
    const next = !screenShareLocked;
    setScreenShareLocked(next);
    broadcastPermissions(micLocked, camLocked, chatLocked, next, mediaAllowed);
    toast.success(next ? "Berbagi layar dikunci" : "Berbagi layar diizinkan");
  }, [micLocked, camLocked, chatLocked, screenShareLocked, mediaAllowed, broadcastPermissions]);

  const toggleMediaAllowed = useCallback(() => {
    const next = !mediaAllowed;
    setMediaAllowed(next);
    broadcastPermissions(micLocked, camLocked, chatLocked, screenShareLocked, next);
    toast.success(next ? "Kirim media diizinkan" : "Kirim media dinonaktifkan");
  }, [micLocked, camLocked, chatLocked, screenShareLocked, mediaAllowed, broadcastPermissions]);

  const muteAll = useCallback(() => {
    room.localParticipant?.publishData(new TextEncoder().encode(JSON.stringify({ type: "mute-all" })));
    toast.success("Permintaan mute dikirim");
  }, [room]);

  const disableAllCameras = useCallback(() => {
    room.localParticipant?.publishData(new TextEncoder().encode(JSON.stringify({ type: "disable-cameras-all" })));
    toast.success("Permintaan matikan kamera dikirim");
  }, [room]);

  const toggleLock = useCallback(() => {
    const next = !locked;
    setLocked(next);
    room.localParticipant?.publishData(new TextEncoder().encode(JSON.stringify({ type: "room-lock", locked: next })));
    toast.success(next ? "Ruangan dikunci" : "Ruangan dibuka");
  }, [locked, room]);

  const endMeeting = useCallback(async () => {
    if (!confirm("Akhiri meeting untuk semua peserta?")) return;
    setEndingMeeting(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENDED" }),
      });
      if (!res.ok) throw new Error("Gagal mengakhiri meeting");
      room.localParticipant?.publishData(new TextEncoder().encode(JSON.stringify({ type: "meeting-ended" })));
      toast.success("Meeting diakhiri");
      router.push(`/meetings/${meetingId}/recap`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal mengakhiri meeting");
      setEndingMeeting(false);
    }
  }, [meetingId, room, router]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-[var(--voon-bg-elevated)] min-h-full">
      <div>
        <h3 className="font-semibold text-white text-sm mb-0.5">Pengaturan Ruangan</h3>
        <p className="text-xs text-gray-500">Konfigurasi perangkat & meeting</p>
      </div>

      {/* Stats */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl border border-white/10 bg-[var(--voon-bg-card)] p-2.5 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-500">Peserta</p>
            <p className="text-sm font-bold text-white">{participants.length}</p>
          </div>
        </div>
        <div className="flex-1 rounded-xl border border-white/10 bg-[var(--voon-bg-card)] p-2.5 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isHost ? "bg-yellow-400" : "bg-blue-400"}`} />
          <div>
            <p className="text-[10px] text-gray-500">Peran</p>
            <p className="text-sm font-bold text-white">{isHost ? "Host" : "Peserta"}</p>
          </div>
        </div>
      </div>

      {/* ── Device Selection ── */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[var(--voon-bg-card)] p-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Perangkat Saya</p>
        <DeviceSelect kind="audioinput" label="Mikrofon"          icon={Mic}     devices={micDevices} selectedId={selectedMic} onChange={handleMicChange} />
        <DeviceSelect kind="videoinput" label="Kamera"            icon={Video}   devices={camDevices} selectedId={selectedCam} onChange={handleCamChange} />
        <DeviceSelect kind="audiooutput" label="Speaker / Headset" icon={Speaker} devices={spkDevices} selectedId={selectedSpk} onChange={handleSpkChange} />
        {micDevices.length === 0 && camDevices.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-1">Izinkan akses perangkat untuk melihat opsi</p>
        )}

        {/* Noise cancellation */}
        <div className="pt-1">
          <NoiseToggle />
        </div>
      </div>

      {/* ── Video Quality ── */}
      <div className="rounded-xl border border-white/10 bg-[var(--voon-bg-card)] p-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Kualitas Video</p>
        <div className="relative">
          <select
            value={videoQuality}
            onChange={(e) => handleVideoQuality(e.target.value as VideoQuality)}
            aria-label="Pilih kualitas video"
            title="Kualitas video"
            className="w-full appearance-none bg-[var(--voon-bg)] border border-white/10 rounded-xl px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {(Object.entries(VIDEO_QUALITY) as [VideoQuality, { label: string }][]).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* ── Bandwidth Saver ── */}
      <div className="rounded-xl border border-white/10 bg-[var(--voon-bg-card)] p-3">
        <button type="button" onClick={() => setPerfMode((p) => !p)} className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {perfMode ? <Zap className="w-4 h-4 text-green-400" /> : <ZapOff className="w-4 h-4 text-gray-400" />}
            <div className="text-left">
              <p className="text-sm text-white">Hemat Bandwidth</p>
              <p className="text-xs text-gray-500">Kurangi kualitas untuk koneksi lemah</p>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ml-2 ${perfMode ? "bg-green-500" : "bg-white/20"}`}>
            <div className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform shadow ${perfMode ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
        </button>
      </div>

      {/* ── Host Controls ── */}
      {isHost && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Izin Peserta</p>
            <PermissionToggle label="Kunci Mikrofon Semua"   icon={MicOff}        locked={micLocked}         onToggle={toggleMicLock} />
            <PermissionToggle label="Kunci Kamera Semua"     icon={Video}         locked={camLocked}         onToggle={toggleCamLock} />
            <PermissionToggle label="Kunci Chat"             icon={MessageSquare} locked={chatLocked}        onToggle={toggleChatLock} />
            <PermissionToggle label="Kunci Berbagi Layar"    icon={Monitor}       locked={screenShareLocked} onToggle={toggleScreenShareLock} />
            <PermissionToggle label="Izinkan Kirim Media"    icon={Image}         locked={!mediaAllowed}     onToggle={toggleMediaAllowed} />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Aksi Host</p>

            <button type="button" onClick={muteAll}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[var(--voon-bg-card)] border border-white/10 hover:border-orange-500/30 hover:bg-orange-500/10 text-white transition-colors">
              <MicOff className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium">Matikan Semua Mic</p>
                <p className="text-xs text-gray-500">Satu kali mute, bisa aktif lagi</p>
              </div>
            </button>

            <button type="button" onClick={disableAllCameras}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[var(--voon-bg-card)] border border-white/10 hover:border-orange-500/30 hover:bg-orange-500/10 text-white transition-colors">
              <Video className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium">Matikan Semua Kamera</p>
                <p className="text-xs text-gray-500">Satu kali matikan, bisa aktif lagi</p>
              </div>
            </button>

            <button type="button" onClick={toggleLock}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[var(--voon-bg-card)] border border-white/10 hover:border-yellow-500/30 hover:bg-yellow-500/10 text-white transition-colors">
              {locked ? <Lock className="w-4 h-4 text-yellow-400 flex-shrink-0" /> : <Unlock className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              <div className="text-left">
                <p className="text-sm font-medium">{locked ? "Buka Ruangan" : "Kunci Ruangan"}</p>
                <p className="text-xs text-gray-500">{locked ? "Izinkan peserta baru" : "Cegah peserta baru"}</p>
              </div>
              <div className={`ml-auto w-10 h-5 rounded-full transition-colors flex-shrink-0 ${locked ? "bg-yellow-500" : "bg-white/20"}`}>
                <div className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform shadow ${locked ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </button>

            <div className="h-px bg-white/5" />

            <button type="button" onClick={endMeeting} disabled={endingMeeting}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50">
              <PhoneOff className="w-4 h-4 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium">{endingMeeting ? "Mengakhiri..." : "Akhiri Meeting"}</p>
                <p className="text-xs text-red-500/70">Hentikan meeting untuk semua</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
