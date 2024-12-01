import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export type Source = {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string | null;
  uploaded_at: string;
};

export const useSources = () => {
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
        () => {
          queryClient.invalidateQueries({ queryKey: ['sources'] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  return { sources, isLoading };
};