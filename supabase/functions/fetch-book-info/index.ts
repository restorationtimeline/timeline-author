import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchGoogleBooksInfo } from "./providers/google-books.ts";
import { fetchWikidataInfo } from "./providers/wikidata.ts";
import { mergeBookData } from "./utils/merge-utils.ts";
import { BookInfo } from "./types.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { isbn } = await req.json();

    if (!isbn) {
      return new Response(
        JSON.stringify({ error: "ISBN is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching book information for ISBN: ${isbn}`);

    // Fetch data from multiple sources concurrently
    const [googleBooksData, wikidataInfo] = await Promise.all([
      fetchGoogleBooksInfo(isbn),
      fetchWikidataInfo(isbn)
    ]);

    // Merge the data from different sources
    const mergedData = mergeBookData(googleBooksData, wikidataInfo);

    return new Response(
      JSON.stringify(mergedData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch book information" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});