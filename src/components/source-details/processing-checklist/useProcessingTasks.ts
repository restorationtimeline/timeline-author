import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const useProcessingTasks = (documentId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('task_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `source_id=eq.${documentId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks', documentId] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [documentId, queryClient]);

  return useQuery({
    queryKey: ['tasks', documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('source_id', documentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });
};