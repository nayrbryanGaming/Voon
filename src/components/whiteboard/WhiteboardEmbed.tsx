"use client";

import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export function WhiteboardEmbed({ roomId }: { roomId: string }) {
  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <Tldraw
        persistenceKey={`voon-wb-${roomId}`}
        className="bg-[var(--voon-bg)]"
      />
    </div>
  );
}
