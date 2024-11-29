import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentList } from "@/components/DocumentList";
import { DocumentGrid } from "@/components/DocumentGrid";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Header } from "@/components/Header";
import { CommandPalette } from "@/components/CommandPalette";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid2X2, List, Kanban } from "lucide-react";
import { useEffect, useState } from "react";

const Index = () => {
  const [activeView, setActiveView] = useState("grid");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Command (Mac) or Control (Windows) key is pressed
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "g":
            e.preventDefault();
            setActiveView("grid");
            break;
          case "l":
            e.preventDefault();
            setActiveView("list");
            break;
          case "b":
            e.preventDefault();
            setActiveView("kanban");
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <CommandPalette />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <DocumentUpload />
          
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid2X2 className="h-4 w-4" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <Kanban className="h-4 w-4" />
                Kanban Board
              </TabsTrigger>
            </TabsList>
            <TabsContent value="grid">
              <DocumentGrid />
            </TabsContent>
            <TabsContent value="list">
              <DocumentList />
            </TabsContent>
            <TabsContent value="kanban">
              <KanbanBoard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;