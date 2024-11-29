import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { FileText, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

type Document = {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string;
  uploaded_at: string;
};

const columns = [
  {
    id: "pending",
    title: "Pending",
    icon: <Clock className="h-5 w-5 text-gray-500" />,
  },
  {
    id: "processing",
    title: "Processing",
    icon: <Clock className="h-5 w-5 text-blue-500 animate-spin" />,
  },
  {
    id: "completed",
    title: "Completed",
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
  },
  {
    id: "failed",
    title: "Failed",
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    action: (failedCount: number) => (
      <div className="flex gap-4 px-8">
        <Button
          variant="ghost"
          size="sm"
          className="p-1 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
          disabled={failedCount === 0}
          onClick={() => {
            toast.info("Retrying failed documents...");
          }}
          aria-label="Retry failed documents"
        >
          <RefreshCw className={`h-4 w-4 ${failedCount === 0 ? 'text-gray-300' : 'text-blue-500'}`} />
        </Button>
      </div>
    ),
  },
];

export const KanbanBoard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
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
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['documents'] });
          
          const eventMessages = {
            INSERT: 'New document added',
            UPDATE: 'Document updated',
            DELETE: 'Document removed'
          };
          
          toast.info(eventMessages[payload.eventType as keyof typeof eventMessages]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const failedDocumentsCount = documents?.filter(doc => doc.status === "failed").length || 0;

  return (
    <div className="grid grid-cols-4 gap-6">
      {columns.map((column) => (
        <div key={column.id} className="flex flex-col bg-white p-4 rounded-lg min-h-[600px] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {column.icon}
              <h3 className="font-semibold">{column.title}</h3>
            </div>
            {column.action && column.action(failedDocumentsCount)}
          </div>
          <div className="flex-1">
            {documents
              ?.filter((doc) => doc.status === column.id)
              .map((doc) => (
                <Card
                  key={doc.id}
                  className="p-4 mb-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/sources/${doc.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium group-hover:text-primary transition-colors">{doc.name}</h4>
                      <p className="text-sm text-gray-500">
                        {doc.type} • {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};