import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

type Source = {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string;
  uploaded_at: string;
};

export const SourceGrid = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: sources, isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .is('deleted_at', null)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data as Source[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('source_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sources'
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['sources'] });
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
      {sources?.map((source) => (
        <Card 
          key={source.id} 
          className="p-4 bg-background dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer border border-border/40"
          onClick={() => navigate(`/sources/${source.id}`)}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground break-words">{source.name}</h3>
          </div>
        </Card>
      ))}
    </div>
  );
};