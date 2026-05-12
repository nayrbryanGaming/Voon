import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { PenTool, Plus } from "lucide-react";
import { randomBytes } from "crypto";

function generateId(): string {
  return randomBytes(5).toString("hex");
}

export default function WhiteboardListPage() {
  const newId = generateId();
  return (
    <div className="min-h-screen">
      <Topbar title="Papan Tulis" />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Papan Tulis</h1>
          <Link
            href={`/whiteboard/${newId}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Baru
          </Link>
        </div>
        <div className="text-center py-20 text-gray-500">
          <PenTool className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Klik &ldquo;Baru&rdquo; untuk membuat papan tulis kolaboratif</p>
        </div>
      </div>
    </div>
  );
}
