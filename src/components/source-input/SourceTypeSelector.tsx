import { Book, Globe, ScrollText, Upload } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDropzone } from 'react-dropzone';
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type SourceType = "book" | "journal" | "url";

interface SourceTypeOption {
  id: SourceType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const sourceTypes: SourceTypeOption[] = [
  {
    id: "book",
    label: "Book",
    icon: <Book className="h-6 w-6" />,
    description: "Upload or reference a book"
  },
  {
    id: "journal",
    label: "Journal",
    icon: <ScrollText className="h-6 w-6" />,
    description: "Add an academic journal or article"
  },
  {
    id: "url",
    label: "URL",
    icon: <Globe className="h-6 w-6" />,
    description: "Add content from a website"
  }
];

export const SourceTypeSelector = () => {
  const [selectedType, setSelectedType] = useState<SourceType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to upload files");
      return;
    }

    for (const file of acceptedFiles) {
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
          .from('sources')
          .insert({
            name: file.name,
            type: file.type,
            status: 'pending',
            uploaded_by: session.user.id,
            storage_path: fileName
          });

        if (dbError) throw dbError;

        toast.success(`Uploaded: ${file.name}`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
        console.error(error);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    noClick: true // Disable click because we want to handle source type selection separately
  });

  const handleContinue = () => {
    if (!selectedType) {
      toast.error("Please select a source type");
      return;
    }
    
    navigate(`/sources/new?type=${selectedType}`);
  };

  return (
    <div className="space-y-6" {...getRootProps()}>
      <input {...getInputProps()} />
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Add New Source</h2>
        <div className="flex flex-col space-y-4">
          <Input
            type="search"
            placeholder="Search across multiple sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xl"
          />
          <p className="text-sm text-muted-foreground">
            Search across Google Scholar, Books, YouTube, Wikipedia, and more
          </p>
        </div>
      </div>

      <div 
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-colors ${
          isDragActive ? 'bg-primary/5 border-2 border-dashed border-primary rounded-lg p-4' : ''
        }`}
      >
        {sourceTypes.map((type) => (
          <Card
            key={type.id}
            className={`relative p-6 cursor-pointer transition-all ${
              selectedType === type.id
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedType(type.id)}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`${
                  selectedType === type.id ? "text-primary" : "text-muted-foreground"
                }`}>
                  {type.icon}
                </div>
                <h3 className="font-medium">{type.label}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {type.description}
              </p>
            </div>
            <div className="absolute top-4 right-4">
              <div className={`h-4 w-4 rounded-full border-2 ${
                selectedType === type.id
                  ? "border-primary bg-primary"
                  : "border-muted"
              }`} />
            </div>
          </Card>
        ))}
      </div>

      {isDragActive && (
        <div className="text-center p-4">
          <Upload className="h-12 w-12 mx-auto text-primary" />
          <p className="mt-2 text-primary font-medium">Drop your files here</p>
        </div>
      )}

      <Button 
        className="w-full md:w-auto"
        onClick={handleContinue}
        disabled={!selectedType}
      >
        Continue
      </Button>
    </div>
  );
};