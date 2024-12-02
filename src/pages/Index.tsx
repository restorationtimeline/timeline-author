import React, { useState } from "react";
import { SourceList } from "@/components/SourceList";
import { SourceGrid } from "@/components/SourceGrid";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Header } from "@/components/Header";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ViewToggle } from "@/components/index/ViewToggle";
import { UploadQueue } from "@/components/UploadQueue";
import { useUploadQueueStore } from "@/stores/uploadQueueStore";
import { STORAGE_KEYS } from "@/constants/storage";
import { FileUploadHandler } from "@/components/file-upload/FileUploadHandler";
import { ViewShortcuts } from "@/components/keyboard-shortcuts/ViewShortcuts";

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
                <SourceGrid />
              </TabsContent>
              <TabsContent value="list" className="w-full mt-0">
                <SourceList />
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