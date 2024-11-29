import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DocumentMetadata } from "@/components/DocumentMetadata";
import { EditableTitle } from "@/components/EditableTitle";
import { Header } from "@/components/Header";
import { DeleteButton } from "@/components/source-details/DeleteButton";
import { ErrorLogs } from "@/components/source-details/ErrorLogs";

const SourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: document, isLoading, error } = useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
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

  if (!document) {
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
              initialValue={document.name}
              onSave={async (newName) => {
                const { error } = await supabase
                  .from("documents")
                  .update({ name: newName })
                  .eq("id", id);
                
                if (error) throw error;
              }}
            />

            <DocumentMetadata document={document} />
            <ErrorLogs errors={document.error_logs} />

            <div className="mt-6">
              <DeleteButton documentId={document.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceDetails;