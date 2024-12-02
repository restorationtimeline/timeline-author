import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  url: string;
  source: string;
  type: string;
  authors?: string[];
  publishedDate?: string;
  imageLinks?: {
    thumbnail?: string;
  };
  identifiers?: {
    isbn?: string[];
    wikidata?: string;
    viaf?: string;
    oclc?: string;
  };
  alternateSourceUrls?: {
    [key: string]: string;
  };
}

export const useUniversalSearch = () => {
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

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    handleSearch
  };
};