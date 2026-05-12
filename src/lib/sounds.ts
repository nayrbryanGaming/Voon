"use client";

let joinAudio: HTMLAudioElement | null = null;
let leaveAudio: HTMLAudioElement | null = null;

function getAudio(src: string, ref: HTMLAudioElement | null): HTMLAudioElement {
  if (ref) return ref;
  const audio = new Audio(src);
  audio.volume = 0.5;
  return audio;
}

export function playJoinSound() {
  try {
    joinAudio = getAudio("/sounds/join.mp3", joinAudio);
    joinAudio.currentTime = 0;
    joinAudio.play().catch(() => {});
  } catch {}
}

export function playLeaveSound() {
  try {
    leaveAudio = getAudio("/sounds/leave.mp3", leaveAudio);
    leaveAudio.currentTime = 0;
    leaveAudio.play().catch(() => {});
  } catch {}
}
