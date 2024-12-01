import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { sourceId } = await req.json()
    console.log('Categorizing source:', sourceId)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update the task status to processing
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('source_id', sourceId)
      .eq('task_name', 'Categorize the Source')

    if (updateError) throw updateError

    // Simulate processing time (remove this in production)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // For demo purposes, randomly assign a category
    const categories = ['primary', 'secondary', 'tertiary']
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]

    // Update the source with the category
    const { error: sourceError } = await supabase
      .from('sources')
      .update({ 
        type: randomCategory,
        identifiers: { 
          ...((await supabase.from('sources').select('identifiers').eq('id', sourceId).single()).data?.identifiers || {}),
          category: randomCategory 
        }
      })
      .eq('id', sourceId)

    if (sourceError) throw sourceError

    // Mark the task as completed
    const { error: completeError } = await supabase
      .from('tasks')
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      })
      .eq('source_id', sourceId)
      .eq('task_name', 'Categorize the Source')

    if (completeError) throw completeError

    return new Response(
      JSON.stringify({ message: 'Source categorized successfully', category: randomCategory }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in categorize-source function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})