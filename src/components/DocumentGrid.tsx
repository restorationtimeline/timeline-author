import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

type Document = {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string;
  uploaded_at: string;
};

const StatusIcon = ({ status }: { status: Document["status"] }) => {
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

export const DocumentGrid = () => {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {documents?.map((doc) => (
        <Card 
          key={doc.id} 
          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/sources/${doc.id}`)}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-lg">{doc.name}</h3>
            <StatusIcon status={doc.status} />
          </div>
        </Card>
      ))}
    </div>
  );
};