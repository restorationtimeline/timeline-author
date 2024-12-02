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
    // Show sources as badges
    const renderSourceBadges = () => {
      const sources = Object.keys(result.alternateSourceUrls || {});
      return (
        <div className="flex gap-2 mt-2">
          {sources.map(source => (
            <span 
              key={source}
              className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
            >
              {source.replace('_', ' ')}
            </span>
          ))}
        </div>
      );
    };

    // Use GoogleBookResult for book entries
    if (result.type === 'book') {
      return (
        <GoogleBookResult
          key={result.id}
          result={result}
          onSelect={() => handleResultSelect(result)}
        />
      );
    }

    // Default result display
    return (
      <div
        key={`${result.source}-${result.id}`}
        className="rounded-lg border p-4 hover:bg-accent cursor-pointer"
        onClick={() => handleResultSelect(result)}
      >
        <div className="flex justify-between">
          <h4 className="font-medium">{result.title}</h4>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
        {renderSourceBadges()}
      </div>
    );
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