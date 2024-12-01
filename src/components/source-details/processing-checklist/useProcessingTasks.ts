import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type Task = {
  id: string;
  source_id: string;
  task_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  last_updated: string | null;
};

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
        (payload: RealtimePostgresChangesPayload<Task>) => {
          // Invalidate and refetch tasks when there's an update
          queryClient.invalidateQueries({ queryKey: ['tasks', documentId] });
          
          // Show toast notifications for task status changes
          if (payload.new && payload.old && payload.new.status !== payload.old.status) {
            const taskName = payload.new.task_name;
            switch (payload.new.status) {
              case 'in_progress':
                toast.info(`Started: ${taskName}`);
                break;
              case 'completed':
                toast.success(`Completed: ${taskName}`);
                break;
              case 'failed':
                toast.error(`Failed: ${taskName}`);
                break;
            }
          }
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
      return data as Task[];
    }
  });
};