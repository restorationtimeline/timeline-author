import { useState } from "react";
import { Header } from "@/components/Header";
import { SourceGrid } from "@/components/SourceGrid";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ViewToggle } from "@/components/index/ViewToggle";
import { CommandPalette } from "@/components/CommandPalette";

const Index = () => {
  const [view, setView] = useState<"grid" | "kanban">("grid");

  return (
    <div>
      <Header />
      <CommandPalette />
      <div className="container mx-auto px-4 md:px-8 py-0 md:py-12">
        <div className="flex justify-end mb-6">
          <ViewToggle view={view} onChange={setView} />
        </div>
        {view === "grid" ? <SourceGrid /> : <KanbanBoard />}
      </div>
    </div>
  );
};

export default Index;