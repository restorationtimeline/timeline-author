import { useProcessingTasks } from "./processing-checklist/useProcessingTasks";
import { useStepExecution } from "./processing-checklist/useStepExecution";
import { ProcessingStep } from "./processing-checklist/ProcessingStep";

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
  const { data: tasks, isLoading } = useProcessingTasks(documentId);
  const { handleRunStep, handleResetStep } = useStepExecution(documentId);

  const getStepStatus = (stepIndex: number) => {
    if (!tasks) return 'pending';
    const task = tasks.find(t => t.task_name === processingSteps[stepIndex]);
    return task?.status || 'pending';
  };

  const isStepEnabled = (stepIndex: number) => {
    if (stepIndex === 0) return true;
    const previousStepStatus = getStepStatus(stepIndex - 1);
    return previousStepStatus === 'completed';
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
        const isNext = !isCompleted && isStepEnabled(index);

        return (
          <ProcessingStep
            key={step}
            step={step}
            status={stepStatus}
            isNext={isNext}
            isCompleted={isCompleted}
            onRunStep={() => handleRunStep(step)}
            onResetStep={() => handleResetStep(step)}
          />
        );
      })}
    </div>
  );
};