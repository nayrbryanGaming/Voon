"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Trash2, Pencil, Minus, Square, Circle as CircleIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

type DrawTool = "pen" | "line" | "rect" | "circle" | "eraser";

interface Point { x: number; y: number }

interface Stroke {
  tool: DrawTool;
  color: string;
  width: number;
  points: Point[];
}

const COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#FFFFFF", "#000000"];
const WIDTHS = [2, 4, 8, 14];

export function AnnotationCanvas({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [tool, setTool] = useState<DrawTool>("pen");
  const [color, setColor] = useState("#EF4444");
  const [width, setWidth] = useState(4);
  const drawing = useRef(false);
  const startPt = useRef<Point>({ x: 0, y: 0 });

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // Redraw all strokes
  const redraw = useCallback((extra?: Stroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const all = extra ? [...strokes, extra] : strokes;
    for (const s of all) {
      if (s.points.length < 2) continue;
      ctx.beginPath();
      ctx.lineWidth = s.width;
      ctx.strokeStyle = s.tool === "eraser" ? "rgba(0,0,0,1)" : s.color;
      ctx.globalCompositeOperation = s.tool === "eraser" ? "destination-out" : "source-over";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (s.tool === "pen" || s.tool === "eraser") {
        ctx.moveTo(s.points[0].x, s.points[0].y);
        for (const p of s.points.slice(1)) ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else if (s.tool === "line") {
        ctx.moveTo(s.points[0].x, s.points[0].y);
        ctx.lineTo(s.points[s.points.length - 1].x, s.points[s.points.length - 1].y);
        ctx.stroke();
      } else if (s.tool === "rect") {
        const [a, b] = [s.points[0], s.points[s.points.length - 1]];
        ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
      } else if (s.tool === "circle") {
        const [a, b] = [s.points[0], s.points[s.points.length - 1]];
        const rx = (b.x - a.x) / 2;
        const ry = (b.y - a.y) / 2;
        ctx.ellipse(a.x + rx, a.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
    }
  }, [strokes]);

  // Resize canvas with container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const { width: w, height: h } = canvas.parentElement!.getBoundingClientRect();
      canvas.width = w;
      canvas.height = h;
      redraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    return () => ro.disconnect();
  }, [redraw]);

  useEffect(() => { redraw(); }, [strokes, redraw]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const pt = getPos(e);
    startPt.current = pt;
    setCurrentStroke({ tool, color, width, points: [pt] });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !currentStroke) return;
    const pt = getPos(e);
    const updated: Stroke = { ...currentStroke, points: [...currentStroke.points, pt] };
    setCurrentStroke(updated);
    redraw(updated);
  };

  const onPointerUp = () => {
    if (!drawing.current || !currentStroke) return;
    drawing.current = false;
    if (currentStroke.points.length > 1) {
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
  };

  const undo = () => setStrokes((prev) => prev.slice(0, -1));
  const clear = () => setStrokes([]);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />

      {/* Toolbar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2 p-2 bg-[var(--voon-bg-elevated)]/95 border border-white/10 rounded-2xl shadow-xl backdrop-blur-sm z-50">
        {/* Tool selector */}
        {([
          { t: "pen" as DrawTool,    Icon: Pencil,      label: "Pena" },
          { t: "line" as DrawTool,   Icon: Minus,       label: "Garis" },
          { t: "rect" as DrawTool,   Icon: Square,      label: "Kotak" },
          { t: "circle" as DrawTool, Icon: CircleIcon,  label: "Lingkaran" },
          { t: "eraser" as DrawTool, Icon: Trash2,      label: "Hapus" },
        ] as const).map(({ t, Icon, label }) => (
          <button key={t} type="button" title={label} onClick={() => setTool(t)}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              tool === t ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"
            )}>
            <Icon className="w-4 h-4" />
          </button>
        ))}

        <div className="w-px h-6 bg-white/10" />

        {/* Color picker */}
        {COLORS.map((c) => (
          <button key={c} type="button" title={c} onClick={() => setColor(c)}
            className={cn(
              "w-5 h-5 rounded-full border-2 transition-transform",
              color === c ? "border-white scale-125" : "border-transparent hover:scale-110"
            )}
            style={{ backgroundColor: c }}
          />
        ))}

        <div className="w-px h-6 bg-white/10" />

        {/* Stroke width */}
        {WIDTHS.map((w) => (
          <button key={w} type="button" onClick={() => setWidth(w)} title={`Ukuran ${w}`}
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
              width === w ? "bg-white/20" : "hover:bg-white/10"
            )}>
            <span className="rounded-full bg-white" style={{ width: w, height: w }} />
          </button>
        ))}

        <div className="w-px h-6 bg-white/10" />

        {/* Undo */}
        <button type="button" onClick={undo} title="Batalkan" disabled={strokes.length === 0}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors text-xs font-bold">
          ↩
        </button>

        {/* Clear */}
        <button type="button" onClick={clear} title="Hapus semua"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Close */}
        <button type="button" onClick={onClose} title="Tutup anotasi"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
