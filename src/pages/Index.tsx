import React, { useState } from "react";
import { DocumentList } from "@/components/DocumentList";
import { DocumentGrid } from "@/components/DocumentGrid";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Header } from "@/components/Header";
import { CommandPalette } from "@/components/CommandPalette";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid2X2, List, Columns3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UploadQueue } from "@/components/UploadQueue";
import { useUploadQueueStore } from "@/stores/uploadQueueStore";
import { STORAGE_KEYS } from "@/constants/storage";
import { FileUploadHandler } from "@/components/file-upload/FileUploadHandler";
import { ViewShortcuts } from "@/components/keyboard-shortcuts/ViewShortcuts";

// ViewToggle component remains in the same file as it's tightly coupled with the Index page
const ViewToggle = ({ activeView, setActiveView }: { activeView: string, setActiveView: (view: string) => void }) => (
  <TabsList className="bg-white dark:bg-gray-800 border">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <TabsTrigger value="grid" className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-[#0EA5E9] data-[state=active]:font-medium">
            <Grid2X2 className="h-4 w-4" />
            Grid
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Grid View (⌘J)</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <TabsTrigger value="kanban" className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-[#0EA5E9] data-[state=active]:font-medium">
            <Columns3 className="h-4 w-4" />
            Kanban
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Kanban View (⌘K)</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-[#0EA5E9] data-[state=active]:font-medium">
            <List className="h-4 w-4" />
            List
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>List View (⌘L)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </TabsList>
);

const Index = () => {
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.PREFERRED_VIEW) || "grid";
  });
  const [isDragging, setIsDragging] = useState(false);
  const uploadQueue = useUploadQueueStore(state => state.items);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREFERRED_VIEW, activeView);
  }, [activeView]);

  return (
    <FileUploadHandler onDragStateChange={setIsDragging}>
      <div className={`min-h-screen bg-background dark:bg-gray-900 transition-colors ${isDragging ? 'bg-primary/5' : ''}`}>
        <Header />
        <CommandPalette />
        <ViewShortcuts setActiveView={setActiveView} />
        
        <div className="container mx-auto px-4 md:px-8 py-0 md:py-12">
          <div className="max-w-6xl mx-auto pt-4">
            <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-6">
                <h2 className="text-2xl font-semibold text-foreground">Sources</h2>
                <ViewToggle activeView={activeView} setActiveView={setActiveView} />
              </div>
              
              {uploadQueue.length > 0 && (
                <div className="mb-6 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                  <UploadQueue items={uploadQueue} />
                </div>
              )}
              
              <TabsContent value="grid" className="w-full mt-0">
                <DocumentGrid />
              </TabsContent>
              <TabsContent value="list" className="w-full mt-0">
                <DocumentList />
              </TabsContent>
              <TabsContent value="kanban" className="w-full mt-0">
                <KanbanBoard />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </FileUploadHandler>
  );
};

export default Index;