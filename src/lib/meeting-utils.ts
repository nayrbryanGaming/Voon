import { nanoid } from "nanoid";

export function generateRoomId(): string {
  return nanoid(12);
}

export function generateInviteCode(): string {
  return nanoid(8).toUpperCase();
}

export function getMeetingInviteUrl(inviteCode: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://voon.vercel.app";
  return `${base}/join/${inviteCode}`;
}

export function getRoomUrl(roomId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://voon.vercel.app";
  return `${base}/room/${roomId}`;
}

export function isMeetingActive(
  startTime: Date,
  endTime?: Date | null,
  status?: string
): boolean {
  if (status === "LIVE") return true;
  if (status === "ENDED" || status === "CANCELLED") return false;
  const now = new Date();
  const fifteenMinBefore = new Date(startTime.getTime() - 15 * 60 * 1000);
  return now >= fifteenMinBefore && (!endTime || now <= endTime);
}

export function getMeetingCountdown(startTime: Date): string {
  const now = new Date();
  const diff = startTime.getTime() - now.getTime();
  if (diff <= 0) return "Dimulai sekarang";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days} hari ${hours}j lagi`;
  if (hours > 0) return `${hours}j ${minutes}m lagi`;
  return `${minutes}m lagi`;
}
