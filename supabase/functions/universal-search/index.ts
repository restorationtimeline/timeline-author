import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "./types.ts"
import { GoogleBooksProvider } from "./providers/google-books.ts"
import { YouTubeProvider } from "./providers/youtube.ts"
import { WikipediaProvider } from "./providers/wikipedia.ts"
import { SearchService } from "./search-service.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const searchService = new SearchService([
      new GoogleBooksProvider(Deno.env.get('GOOGLE_API_KEY') || ''),
      new YouTubeProvider(Deno.env.get('YOUTUBE_API_KEY') || ''),
      new WikipediaProvider()
    ]);

    const results = await searchService.search(query);

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})