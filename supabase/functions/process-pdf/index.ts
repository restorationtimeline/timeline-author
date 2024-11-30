import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the document ID and file path from the request
    const { documentId, filePath } = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download the PDF file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(filePath)

    if (downloadError) {
      throw new Error(`Failed to download PDF: ${downloadError.message}`)
    }

    // Load the PDF document
    const pdfBytes = await fileData.arrayBuffer()
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const pageCount = pdfDoc.getPageCount()

    // Create a directory for the pages
    const directory = `${documentId}/pages`
    const pageFiles = []

    // Split and save each page
    for (let i = 0; i < pageCount; i++) {
      // Create a new document with just this page
      const newPdf = await PDFDocument.create()
      const [page] = await newPdf.copyPages(pdfDoc, [i])
      newPdf.addPage(page)
      
      // Save the page
      const pageBytes = await newPdf.save()
      const pageFileName = `page_${i + 1}.pdf`
      const pagePath = `${directory}/${pageFileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(pagePath, pageBytes, {
          contentType: 'application/pdf',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Failed to upload page ${i + 1}: ${uploadError.message}`)
      }

      pageFiles.push(pagePath)
    }

    // Update document metadata with page information
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        identifiers: {
          storage_path: filePath,
          pages: pageFiles,
          page_count: pageCount
        }
      })
      .eq('id', documentId)

    if (updateError) {
      throw new Error(`Failed to update document metadata: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        pageCount,
        pages: pageFiles 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    )
  }
})