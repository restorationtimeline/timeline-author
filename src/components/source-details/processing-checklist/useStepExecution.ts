import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useStepExecution = (documentId: string) => {
  const handleRunStep = async (stepName: string) => {
    try {
      const loadingToast = toast.loading(`Starting ${stepName}...`);
      
      // Create the task if it doesn't exist
      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          source_id: documentId,
          task_name: stepName,
          status: 'pending'
        })
        .select()
        .single();

      if (taskError && !taskError.message.includes('duplicate')) {
        throw taskError;
      }

      // If it's the categorization step, call the edge function
      if (stepName === "Categorize the Source") {
        const { data, error } = await supabase.functions.invoke('categorize-source', {
          body: { sourceId: documentId }
        });

        if (error) throw error;
        
        toast.dismiss(loadingToast);
        toast.success(`${stepName} completed successfully`);
        return;
      }

      // For other steps, just update the task status (placeholder)
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('source_id', documentId)
        .eq('task_name', stepName);

      if (error) throw error;

      toast.dismiss(loadingToast);
      toast.success(`${stepName} completed`);
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error("Failed to start processing");
    }
  };

  const handleResetStep = async (stepName: string) => {
    try {
      const loadingToast = toast.loading(`Resetting ${stepName}...`);
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'pending',
          started_at: null,
          completed_at: null
        })
        .eq('source_id', documentId)
        .eq('task_name', stepName);

      if (error) throw error;

      toast.dismiss(loadingToast);
      toast.success(`${stepName} reset successfully`);
    } catch (error) {
      console.error('Error resetting task:', error);
      toast.error("Failed to reset task");
    }
  };

  return { handleRunStep, handleResetStep };
};