import { CheckCircle2, Circle, CirclePlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const processingSteps = [
  "Categorize the Source",
  "Extract Content and Metadata",
  "Split Content into Individual Pages",
  "Link to Online Identifiers",
  "Semantically Chunk Content",
  "Create Embeddings",
  "Run Named Entity Recognition (NER)",
  "Review and Approval"
];

interface ProcessingChecklistProps {
  status: string;
  documentId: string;
}

export const ProcessingChecklist = ({ status, documentId }: ProcessingChecklistProps) => {
  const { data: tasks, isLoading } = useQuery({
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

  const getStepStatus = (stepIndex: number) => {
    if (!tasks) return 'pending';
    const task = tasks.find(t => t.task_name === processingSteps[stepIndex]);
    return task?.status || 'pending';
  };

  const handleRunNextStep = async (stepIndex: number) => {
    try {
      const stepName = processingSteps[stepIndex];
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

  if (isLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-medium mb-4">Processing Status</h3>
        <div className="animate-pulse space-y-3">
          {processingSteps.map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
      <h3 className="text-lg font-medium mb-4">Processing Status</h3>
      {processingSteps.map((step, index) => {
        const stepStatus = getStepStatus(index);
        const isCompleted = stepStatus === 'completed';
        const isNext = stepStatus === 'pending' && 
          (index === 0 || getStepStatus(index - 1) === 'completed');

        return (
          <div key={step} className="flex items-center space-x-3">
            {isNext ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0"
                onClick={() => handleRunNextStep(index)}
              >
                <CirclePlay className="h-5 w-5 text-blue-500" />
              </Button>
            ) : isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
            )}
            <span className={isCompleted ? "text-foreground" : "text-muted-foreground"}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};