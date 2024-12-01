import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Crawler } from "https://deno.land/x/crawler@0.4.2/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { url } = await req.json()
    if (!url) {
      throw new Error('URL is required')
    }

    // Update status to processing
    const { error: updateError } = await supabaseClient
      .from('crawl_queue')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('url', url)

    if (updateError) {
      console.error('Error updating status:', updateError)
      throw updateError
    }

    const domain = new URL(url).hostname
    const crawler = new Crawler()
    
    crawler.on('data', async (data) => {
      try {
        const pageUrl = new URL(data.url)
        if (pageUrl.hostname === domain && data.contentType?.includes('text/html')) {
          // Add to crawl queue if not already present
          const { error } = await supabaseClient
            .from('crawl_queue')
            .insert({
              url: data.url,
              domain: domain,
              parent_url: url,
              status: 'pending'
            })
            .select()
          
          if (error && !error.message.includes('duplicate')) {
            console.error('Error inserting URL:', error)
          }
        }
      } catch (error) {
        console.error('Error processing URL:', error)
      }
    })

    await crawler.crawl(url)

    // Update status to completed
    const { error: completeError } = await supabaseClient
      .from('crawl_queue')
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      })
      .eq('url', url)

    if (completeError) {
      console.error('Error updating completion status:', completeError)
      throw completeError
    }

    return new Response(
      JSON.stringify({ message: 'Crawl completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})