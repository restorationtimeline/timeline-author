import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  type: string;
}

async function searchGoogleBooks(query: string): Promise<SearchResult[]> {
  const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
  if (!GOOGLE_API_KEY) {
    console.error('Google API key not found');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`
    );
    const data = await response.json();
    
    return (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      description: item.volumeInfo.description || '',
      url: item.volumeInfo.infoLink,
      source: 'google_books',
      type: 'book'
    }));
  } catch (error) {
    console.error('Google Books search error:', error);
    return [];
  }
}

async function searchYouTube(query: string): Promise<SearchResult[]> {
  const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key not found');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&type=video`
    );
    const data = await response.json();
    
    return (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      source: 'youtube',
      type: 'video'
    }));
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

async function searchWikipedia(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
    );
    const data = await response.json();
    
    return (data.query?.search || []).map((item: any) => ({
      id: item.pageid.toString(),
      title: item.title,
      description: item.snippet.replace(/<\/?[^>]+(>|$)/g, ""),
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
      source: 'wikipedia',
      type: 'article'
    }));
  } catch (error) {
    console.error('Wikipedia search error:', error);
    return [];
  }
}

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