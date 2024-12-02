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
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};