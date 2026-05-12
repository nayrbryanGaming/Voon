"use client";

import { FileText, Download } from "lucide-react";

export function AITranscriptViewer({ content }: { content: string }) {
  const download = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transkrip.txt";
    a.click();
  };

  return (
    <div className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <h2 className="text-white font-semibold">Transkrip</h2>
        </div>
        <button
          onClick={download}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto text-gray-400 text-sm leading-relaxed whitespace-pre-wrap font-mono">
        {content}
      </div>
    </div>
  );
}
