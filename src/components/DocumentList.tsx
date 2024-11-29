import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type Document = {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string | null;
  uploaded_at: string;
};

const StatusIcon = ({ status }: { status: Document["status"] }) => {
  switch (status) {
    case "processing":
      return <Clock className="h-5 w-5 text-accent animate-spin" />;
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "failed":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

const StatusLabel = ({ status }: { status: Document["status"] }) => {
  switch (status) {
    case "processing":
      return "Processing";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    default:
      return "Pending";
  }
};

export const DocumentList = () => {
  const navigate = useNavigate();
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
  });

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <Clock className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  const groupedDocuments = documents?.reduce((acc, doc) => {
    if (!acc[doc.status]) {
      acc[doc.status] = [];
    }
    acc[doc.status].push(doc);
    return acc;
  }, {} as Record<Document["status"], Document[]>);

  const statusOrder: Document["status"][] = ["processing", "pending", "completed", "failed"];

  return (
    <div className="w-full space-y-8">
      {statusOrder.map((status) => {
        const docs = groupedDocuments?.[status] || [];
        if (docs.length === 0) return null;

        return (
          <div key={status} className="space-y-4">
            <div className="flex items-center gap-2">
              <StatusIcon status={status} />
              <h2 className="text-lg font-semibold text-gray-900">
                {StatusLabel({ status })} ({docs.length})
              </h2>
            </div>
            <div className="space-y-4">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-white rounded-lg shadow-sm border animate-fade-up hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/sources/${doc.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.name}</h3>
                        <p className="text-sm text-gray-500">
                          {doc.type || "Document"} • Uploaded on{" "}
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <StatusIcon status={doc.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};