import { Topbar } from "@/components/layout/Topbar";
import { WhiteboardEmbed } from "@/components/whiteboard/WhiteboardEmbed";

export default async function WhiteboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar title="Papan Tulis" />
      <div className="flex-1">
        <WhiteboardEmbed roomId={id} />
      </div>
    </div>
  );
}
