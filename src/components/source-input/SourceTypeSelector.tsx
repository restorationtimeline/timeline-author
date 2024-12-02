import { Book, Globe, ScrollText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedType) {
      toast.error("Please select a source type");
      return;
    }
    
    // Navigate to the appropriate form based on type
    switch (selectedType) {
      case "url":
        navigate("/sources/new?type=url");
        break;
      case "book":
        navigate("/sources/new?type=book");
        break;
      case "journal":
        navigate("/sources/new?type=journal");
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Add New Source</h2>
        <p className="text-sm text-muted-foreground">
          Choose the type of source you want to add
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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