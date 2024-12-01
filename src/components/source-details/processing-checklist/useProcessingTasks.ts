import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

type RealtimePayload = {
  new: Task;
  old: Task;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
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
        (payload: RealtimePayload) => {
          // Invalidate and refetch tasks when there's an update
          queryClient.invalidateQueries({ queryKey: ['tasks', documentId] });
          
          // Show toast notifications for task status changes
          if (payload.new && payload.old && payload.new.status !== payload.old.status) {
            const taskName = payload.new.task_name;
            switch (payload.new.status as TaskStatus) {
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