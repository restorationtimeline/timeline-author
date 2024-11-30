import { CheckCircle2, Circle, CirclePlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const processingSteps = [
  "Split Content into Individual Pages",
  "Extract Content and Metadata",
  "Categorize the Source",
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
  const getCompletedSteps = () => {
    switch (status) {
      case 'completed':
        return processingSteps.length;
      case 'processing':
        return 2;
      case 'failed':
        return 0;
      default:
        return 1;
    }
  };

  const handleRunNextStep = async (stepIndex: number) => {
    try {
      toast.loading("Processing next step...");
      // TODO: Implement the actual processing logic here
      toast.success("Processing started");
    } catch (error) {
      toast.error("Failed to start processing");
      console.error(error);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
      <h3 className="text-lg font-medium mb-4">Processing Status</h3>
      {processingSteps.map((step, index) => (
        <div key={step} className="flex items-center space-x-3">
          {index === completedSteps ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0"
              onClick={() => handleRunNextStep(index)}
            >
              <CirclePlay className="h-5 w-5 text-blue-500" />
            </Button>
          ) : index < completedSteps ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
          )}
          <span className={index < completedSteps ? "text-foreground" : "text-muted-foreground"}>
            {step}
          </span>
        </div>
      ))}
    </div>
  );
};