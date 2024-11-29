import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "processing":
      return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "failed":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

const SourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: document, isLoading } = useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Source not found</h1>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{document.name}</h1>
              <p className="text-gray-500">
                {document.type || "Document"} • Uploaded on{" "}
                {new Date(document.uploaded_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon status={document.status} />
            <span className="text-sm font-medium capitalize">{document.status}</span>
          </div>
        </div>

        {document.error_logs && document.error_logs.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <h3 className="text-red-800 font-medium mb-2">Error Logs</h3>
            <ul className="list-disc list-inside space-y-1">
              {document.error_logs.map((error, index) => (
                <li key={index} className="text-red-600 text-sm">{error}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SourceDetails;