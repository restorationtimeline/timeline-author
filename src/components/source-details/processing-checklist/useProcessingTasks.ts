import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProcessingTasks = (documentId: string) => {
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