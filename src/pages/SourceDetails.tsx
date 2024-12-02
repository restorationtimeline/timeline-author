import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { SourceMetadata } from "@/components/SourceMetadata";
import { EditableTitle } from "@/components/EditableTitle";
import { Header } from "@/components/Header";
import { DeleteButton } from "@/components/source-details/DeleteButton";
import { ErrorLogs } from "@/components/source-details/ErrorLogs";
import { IdentifiersForm } from "@/components/source-details/IdentifiersForm";
import { MetadataForm } from "@/components/source-details/MetadataForm";
import { ProcessingChecklist } from "@/components/source-details/ProcessingChecklist";
import { toast } from "sonner";

const SourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: source, isLoading, error } = useQuery({
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
    if (!source?.storage_path) {
      toast.error("No file path found");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(source.storage_path);

      if (error) {
        console.error("Download error:", error);
        throw error;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = source.name;
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
        <div className="container mx-auto px-4 md:px-8 py-0 md:py-12">
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
        <div className="container mx-auto px-4 md:px-8 py-0 md:py-12 max-w-2xl">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Error loading source</h1>
          <p className="text-gray-600 mb-4">There was an error loading the source details.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!source) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 md:px-8 py-0 md:py-12 max-w-2xl">
          <h1 className="text-2xl font-bold mb-4">Source not found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 md:px-8 py-0 md:py-12">
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
              initialValue={source.name}
              onSave={async (newName) => {
                const { error } = await supabase
                  .from("sources")
                  .update({ name: newName })
                  .eq("id", id);
                
                if (error) throw error;
              }}
            />

            <SourceMetadata source={source} />
            <ErrorLogs errors={source.error_logs || []} />
            
            <ProcessingChecklist 
              status={source.status} 
              documentId={source.id} 
            />
            
            <IdentifiersForm 
              documentId={source.id} 
              initialIdentifiers={source.identifiers} 
            />

            <MetadataForm 
              documentId={source.id} 
              initialMetadata={source.metadata} 
            />

            <div className="mt-6 space-y-4">
              {source.storage_path && (
                <Button 
                  size="lg" 
                  className="w-full h-16 bg-green-600 hover:bg-green-700 select-none"
                  onClick={handleDownload}
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download File
                </Button>
              )}
              <DeleteButton documentId={source.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceDetails;