import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function crawlUrl(url: string): Promise<string[]> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Basic HTML parsing to find links
    const urlPattern = /href=["'](https?:\/\/[^"']+)["']/g;
    const matches = [...html.matchAll(urlPattern)];
    const links = matches.map(match => match[1]);
    
    // Filter out non-HTML resources
    const excludePatterns = /\.(css|js|png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz|mp3|mp4|wav|avi|mov|webm|woff|woff2|ttf|eot)$/i;
    return links.filter(link => !excludePatterns.test(link));
  } catch (error) {
    console.error(`Error crawling ${url}:`, error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { url } = await req.json();
    if (!url) {
      throw new Error('URL is required');
    }

    console.log('Starting crawl for URL:', url);
    
    // Update status to processing
    const { error: updateError } = await supabaseClient
      .from('crawl_queue')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString() 
      })
      .eq('url', url);

    if (updateError) {
      console.error('Error updating status:', updateError);
      throw updateError;
    }

    const domain = new URL(url).hostname;
    const links = await crawlUrl(url);
    
    // Filter links from same domain and add to queue
    const sameDomainLinks = links.filter(link => {
      try {
        return new URL(link).hostname === domain;
      } catch {
        return false;
      }
    });

    // Add new URLs to crawl queue
    for (const link of sameDomainLinks) {
      const { error } = await supabaseClient
        .from('crawl_queue')
        .insert({
          url: link,
          domain: domain,
          parent_url: url,
          status: 'pending'
        })
        .select();
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Error inserting URL:', error);
      }
    }

    // Update original URL status to completed
    const { error: completeError } = await supabaseClient
      .from('crawl_queue')
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      })
      .eq('url', url);

    if (completeError) {
      console.error('Error updating completion status:', completeError);
      throw completeError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Crawl completed successfully',
        crawledUrls: sameDomainLinks.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});