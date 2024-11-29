import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Clock } from "lucide-react";
import { DocumentListItem } from "./document-list/DocumentListItem";
import { StatusIcon } from "./document-list/StatusIcon";

type Document = {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string | null;
  uploaded_at: string;
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
  const queryClient = useQueryClient();
  
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .is('deleted_at', null)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('document_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['documents'] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

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
                <DocumentListItem
                  key={doc.id}
                  document={doc}
                  onClick={() => navigate(`/sources/${doc.id}`)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};