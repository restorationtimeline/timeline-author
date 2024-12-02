import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileUp, PenLine, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  type: string;
}

interface ContentTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const ContentTypeSelector = ({ value, onValueChange }: ContentTypeSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('universal-search', {
        body: { query: searchQuery }
      });

      if (error) throw error;

      setSearchResults(data.results || []);
      
      if (data.results?.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search term",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const contentTypes = [
    {
      id: "file",
      label: "Upload File",
      description: "Upload PDF or EPUB files directly",
      icon: <FileUp className="h-4 w-4" />
    },
    {
      id: "manual",
      label: "Create Manual Source",
      description: "Manually create and enter source details",
      icon: <PenLine className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search across Google Scholar, Books, YouTube, Wikipedia, and more..."
            className="w-full pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Search and import content from multiple sources
        </p>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Search Results</h3>
          <div className="space-y-2">
            {searchResults.map((result) => (
              <div
                key={`${result.source}-${result.id}`}
                className="rounded-lg border p-4 hover:bg-accent cursor-pointer"
                onClick={() => {
                  // Here you would handle adding the source to your system
                  toast({
                    title: "Source selected",
                    description: `Selected ${result.title}`,
                  });
                }}
              >
                <div className="flex justify-between">
                  <h4 className="font-medium">{result.title}</h4>
                  <span className="text-sm text-muted-foreground">{result.source}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Or choose an option:</h3>
        <RadioGroup
          value={value}
          onValueChange={onValueChange}
          className="grid gap-4 grid-cols-2"
        >
          {contentTypes.map((type) => (
            <div key={type.id}>
              <RadioGroupItem
                value={type.id}
                id={type.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={type.id}
                className="flex flex-col rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-2">
                  {type.icon}
                  <p className="font-medium leading-none">{type.label}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {type.description}
                </p>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};