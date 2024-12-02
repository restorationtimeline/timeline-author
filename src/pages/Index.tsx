import { useState } from "react";
import { Header } from "@/components/Header";
import { ContentTypeSelector } from "@/components/source-input/ContentTypeSelector";
import { DocumentUpload } from "@/components/DocumentUpload";

const Index = () => {
  const [selectedType, setSelectedType] = useState("file");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Add Content</h2>
            <p className="text-muted-foreground mb-6">
              Select how you want to add content to the timeline
            </p>
            <ContentTypeSelector 
              value={selectedType} 
              onValueChange={setSelectedType} 
            />
          </div>
          
          {selectedType === "file" && (
            <div className="mt-8">
              <DocumentUpload />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;