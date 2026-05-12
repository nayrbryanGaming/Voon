"use client";

import { Brain, TrendingUp } from "lucide-react";

interface AISummaryCardProps {
  summary: {
    summary: string;
    keyPoints: string[];
    topics: string[];
    sentiment?: string | null;
  };
}

const sentimentConfig = {
  productive: { label: "Produktif", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  neutral: { label: "Netral", className: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  challenging: { label: "Menantang", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
};

export function AISummaryCard({ summary }: AISummaryCardProps) {
  const sentiment = sentimentConfig[summary.sentiment as keyof typeof sentimentConfig];

  return (
    <div className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h2 className="text-white font-semibold">Ringkasan AI</h2>
        </div>
        {sentiment && (
          <span className={`text-xs px-2 py-1 rounded-lg border flex items-center gap-1 ${sentiment.className}`}>
            <TrendingUp className="w-3 h-3" />
            {sentiment.label}
          </span>
        )}
      </div>

      <p className="text-gray-300 text-sm leading-relaxed mb-5">{summary.summary}</p>

      {summary.keyPoints.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Poin Utama</h3>
          <ul className="space-y-1.5">
            {summary.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.topics.length > 0 && (
        <div>
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Topik</h3>
          <div className="flex flex-wrap gap-1.5">
            {summary.topics.map((topic) => (
              <span key={topic} className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
