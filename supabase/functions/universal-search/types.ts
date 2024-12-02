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

export interface SearchProvider {
  search: (query: string) => Promise<SearchResult[]>;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};