import { Circle, CheckCircle2, CirclePlay } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcessingStepProps {
  step: string;
  status: string;
  isNext: boolean;
  isCompleted: boolean;
  onRunStep: () => void;
}

export const ProcessingStep = ({ step, status, isNext, isCompleted, onRunStep }: ProcessingStepProps) => {
  return (
    <div className="flex items-center space-x-3">
      {isNext ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0"
          onClick={onRunStep}
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
};