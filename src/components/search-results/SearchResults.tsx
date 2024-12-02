import { toast } from "@/components/ui/use-toast";
import { GoogleBookResult } from "./GoogleBookResult";
import type { SearchResult } from "@/hooks/useUniversalSearch";

interface SearchResultsProps {
  results: SearchResult[];
}

export const SearchResults = ({ results }: SearchResultsProps) => {
  const handleResultSelect = (result: SearchResult) => {
    toast({
      title: "Source selected",
      description: `Selected ${result.title}`,
    });
  };

  const renderSearchResult = (result: SearchResult) => {
    switch (result.source) {
      case 'google_books':
        return (
          <GoogleBookResult
            key={result.id}
            result={result}
            onSelect={() => handleResultSelect(result)}
          />
        );
      default:
        return (
          <div
            key={`${result.source}-${result.id}`}
            className="rounded-lg border p-4 hover:bg-accent cursor-pointer"
            onClick={() => handleResultSelect(result)}
          >
            <div className="flex justify-between">
              <h4 className="font-medium">{result.title}</h4>
              <span className="text-sm text-muted-foreground">{result.source}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
          </div>
        );
    }
  };

  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Search Results</h3>
      <div className="space-y-2">
        {results.map(renderSearchResult)}
      </div>
    </div>
  );
};