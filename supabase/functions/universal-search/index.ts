import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, type SearchResult } from "./types.ts"
import { searchGoogleBooks } from "./providers/google-books.ts"
import { searchYouTube } from "./providers/youtube.ts"
import { searchWikipedia } from "./providers/wikipedia.ts"

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

    // Perform parallel searches across all sources
    const [googleBooks, youtube, wikipedia] = await Promise.all([
      searchGoogleBooks(query),
      searchYouTube(query),
      searchWikipedia(query)
    ]);

    const results = [...googleBooks, ...youtube, ...wikipedia];

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