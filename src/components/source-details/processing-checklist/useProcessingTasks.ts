import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { TaskStatus } from '@/integrations/supabase/types';

interface Task {
  id: string;
  task_name: string;
  status: TaskStatus;
  started_at: string | null;
  completed_at: string | null;
}

export const useProcessingTasks = (sourceId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `source_id=eq.${sourceId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks', sourceId] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [sourceId, queryClient]);

  return useQuery({
    queryKey: ['tasks', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('source_id', sourceId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
  });
};