import { DocumentList } from "@/components/DocumentList";
import { DocumentGrid } from "@/components/DocumentGrid";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Header } from "@/components/Header";
import { CommandPalette } from "@/components/CommandPalette";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid2X2, List, Kanban } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Index = () => {
  const [activeView, setActiveView] = useState("grid");
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "j":
            e.preventDefault();
            setActiveView("grid");
            break;
          case "l":
            e.preventDefault();
            setActiveView("list");
            break;
          case "k":
            e.preventDefault();
            setActiveView("kanban");
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive",
      });
      return;
    }

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            name: file.name,
            type: file.type,
            status: 'pending',
            uploaded_by: session.user.id
          });

        if (dbError) throw dbError;

        toast({
          title: "Success",
          description: `Uploaded: ${file.name}`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
        console.error(error);
      }
    }
  };

  return (
    <div 
      className={`min-h-screen bg-gray-100 transition-colors ${isDragging ? 'bg-primary/5' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Header />
      <CommandPalette />
      <div className="container mx-auto">
        <div className="flex flex-col space-y-8 py-8">
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Sources</h2>
              <TabsList className="bg-white border">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="grid" 
                        className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-[#0EA5E9] data-[state=active]:font-medium"
                      >
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
                      <TabsTrigger 
                        value="kanban" 
                        className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-[#0EA5E9] data-[state=active]:font-medium"
                      >
                        <Kanban className="h-4 w-4" />
                        Kanban
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Kanban View (⌘K)</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="list" 
                        className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-[#0EA5E9] data-[state=active]:font-medium"
                      >
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
            </div>
            
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
  );
};

export default Index;