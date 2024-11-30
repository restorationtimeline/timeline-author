import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { DocumentMetadata } from "@/components/DocumentMetadata";
import { EditableTitle } from "@/components/EditableTitle";
import { Header } from "@/components/Header";
import { DeleteButton } from "@/components/source-details/DeleteButton";
import { ErrorLogs } from "@/components/source-details/ErrorLogs";
import { IdentifiersForm } from "@/components/source-details/IdentifiersForm";
import { toast } from "sonner";

const SourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: documentData, isLoading, error } = useQuery({
    queryKey: ["source", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      return data;
    },
    retry: 1,
  });

  const handleDownload = async () => {
    if (!documentData?.storage_path) {
      toast.error("No file path found");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(documentData.storage_path);

      if (error) {
        console.error("Download error:", error);
        throw error;
      }

      // Create a download link and trigger it
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentData.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("File download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto">
          <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="container mx-auto py-8 max-w-2xl">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Error loading source</h1>
          <p className="text-gray-600 mb-4">There was an error loading the document details.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div>
        <Header />
        <div className="container mx-auto py-8 max-w-2xl">
          <h1 className="text-2xl font-bold mb-4">Source not found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto">
        <div className="max-w-2xl mx-auto pt-4">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="space-y-6">
            <EditableTitle
              initialValue={documentData.name}
              onSave={async (newName) => {
                const { error } = await supabase
                  .from("sources")
                  .update({ name: newName })
                  .eq("id", id);
                
                if (error) throw error;
              }}
            />

            <DocumentMetadata document={documentData} />
            <ErrorLogs errors={documentData.error_logs || []} />
            
            <IdentifiersForm 
              documentId={documentData.id} 
              initialIdentifiers={documentData.identifiers} 
            />

            <div className="mt-6 space-y-4">
              <Button 
                size="lg" 
                className="w-full h-16 bg-green-600 hover:bg-green-700 select-none"
                onClick={handleDownload}
              >
                <Download className="h-5 w-5 mr-2" />
                Download File
              </Button>
              <DeleteButton documentId={documentData.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceDetails;