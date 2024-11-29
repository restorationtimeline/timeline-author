import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentList } from "@/components/DocumentList";
import { Header } from "@/components/Header";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Restoration Timeline Documents
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Upload and manage historical documents for research and analysis
            </p>
          </div>
          
          <DocumentUpload />
          
          <Tabs defaultValue="list" className="w-full">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            </TabsList>
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