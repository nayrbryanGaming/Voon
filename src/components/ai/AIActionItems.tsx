"use client";

import { CheckSquare } from "lucide-react";

export function AIActionItems({ items }: { items: string[] }) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--voon-bg-card)] border border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <CheckSquare className="w-5 h-5 text-emerald-400" />
        <h2 className="text-white font-semibold">Action Items</h2>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
            <div className="w-5 h-5 rounded border border-emerald-500/40 bg-emerald-500/10 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-300">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
