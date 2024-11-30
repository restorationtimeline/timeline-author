import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Card } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

type Document = {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string;
  uploaded_at: string;
  uploaded_by: string;
  created_at: string | null;
  deleted_at: string | null;
  error_logs: string[] | null;
  identifiers: Record<string, unknown> | null;
  last_updated: string | null;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
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
      const { data: docs, error } = await supabase
        .from("documents")
        .select("*, profiles:uploaded_by(first_name, last_name)")
        .is('deleted_at', null)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return docs as Document[];
    },
  });

  const handleProcessing = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'processing' })
        .eq('id', docId);
      
      if (error) throw error;
      
      toast.success("Started processing document");
    } catch (error) {
      toast.error("Failed to start processing");
      console.error(error);
    }
  };

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
            <FileText className="h-6 w-6 text-primary" />
            <StatusIcon status={doc.status} />
          </div>
          <h3 className="font-medium text-lg mb-3">{doc.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {doc.profiles?.first_name?.[0]}{doc.profiles?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">
                {doc.profiles?.first_name} {doc.profiles?.last_name}
              </span>
            </div>
            {doc.status === 'pending' && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProcessing(doc.id);
                }}
              >
                Process
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};