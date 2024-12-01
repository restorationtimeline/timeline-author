import { Check, Loader2, PlayCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

interface ProcessingStepProps {
  step: string;
  status: TaskStatus;
  isNext: boolean;
  isCompleted: boolean;
  onRunStep: () => void;
  onResetStep: () => void;
}

export const ProcessingStep = ({ 
  step, 
  status, 
  isNext, 
  isCompleted,
  onRunStep,
  onResetStep
}: ProcessingStepProps) => {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-2">
        {status === 'in_progress' && (
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        )}
        {status === 'completed' && (
          <Check className="h-4 w-4 text-green-500" />
        )}
        <span className={isCompleted ? "text-muted-foreground" : ""}>{step}</span>
      </div>
      <div className="flex gap-2">
        {isNext && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRunStep}
            disabled={status === 'in_progress'}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Run
          </Button>
        )}
        {(['completed', 'failed'] as const).includes(status) && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetStep}
            disabled={status === 'in_progress'}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};