import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { KanbanColumn } from "./kanban/KanbanColumn";

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
    showRetryButton: true,
  },
];

export const KanbanBoard = () => {
  const queryClient = useQueryClient();
  
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sources")
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
          table: 'sources'
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

  const groupedDocuments = documents?.reduce((acc, doc) => {
    if (!acc[doc.status]) {
      acc[doc.status] = [];
    }
    acc[doc.status].push(doc);
    return acc;
  }, {} as Record<Document["status"], Document[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          {...column}
          documents={groupedDocuments?.[column.id as Document["status"]] || []}
        />
      ))}
    </div>
  );
};