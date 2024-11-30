import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
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
    icon: <Clock className="h-4 w-4 text-gray-500" />,
  },
  {
    id: "processing",
    title: "Processing",
    icon: <Clock className="h-4 w-4 text-blue-500 animate-spin" />,
  },
  {
    id: "completed",
    title: "Completed",
    icon: <CheckCircle className="h-4 w-4 text-green-500" />,
  },
  {
    id: "failed",
    title: "Failed",
    icon: <AlertCircle className="h-4 w-4 text-red-500" />,
    action: (failedCount: number) => (
      <div className="flex gap-2 px-4">
        <Button
          variant="ghost"
          size="sm"
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors border border-gray-200 dark:border-gray-700"
          disabled={failedCount === 0}
          onClick={() => {
            toast.info("Retrying failed documents...");
          }}
          aria-label="Retry failed documents"
        >
          <RefreshCw className={`h-3 w-3 ${failedCount === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-blue-500'}`} />
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
    return <div className="text-foreground">Loading...</div>;
  }

  const failedDocumentsCount = documents?.filter(doc => doc.status === "failed").length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map((column) => (
        <div key={column.id} className="flex flex-col bg-white dark:bg-gray-800 p-3 rounded-lg min-h-[300px] md:min-h-[600px] shadow-sm border border-border/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              {column.icon}
              <h3 className="text-lg font-medium text-foreground">{column.title}</h3>
            </div>
            {column.action && column.action(failedDocumentsCount)}
          </div>
          <div className="flex-1 overflow-auto">
            {documents
              ?.filter((doc) => doc.status === column.id)
              .map((doc) => (
                <Card
                  key={doc.id}
                  className="p-2 mb-2 hover:shadow-md transition-shadow cursor-pointer bg-background dark:bg-gray-700/50"
                  onClick={() => navigate(`/sources/${doc.id}`)}
                >
                  <div>
                    <h4 className="text-lg font-medium text-foreground truncate">{doc.name}</h4>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};