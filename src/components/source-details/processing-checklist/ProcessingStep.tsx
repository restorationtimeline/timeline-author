import React from 'react';
import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type TaskStatus = Database['public']['Enums']['task_status_enum'];

interface ProcessingStepProps {
  name: string;
  description?: string;
  status: TaskStatus;
  isNext?: boolean;
  isCompleted?: boolean;
  onRunStep?: () => Promise<void>;
  onResetStep?: () => Promise<void>;
  isLast?: boolean;
}

export const ProcessingStep = ({
  name,
  description,
  status,
  isNext = false,
  isCompleted = false,
  onRunStep,
  onResetStep,
  isLast = false,
}: ProcessingStepProps) => {
  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      case 'in_progress':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="relative pb-8 last:pb-0">
      {!isLast && (
        <div className="absolute left-4 top-8 -bottom-8 w-px bg-border dark:bg-gray-800" />
      )}
      <div className="flex gap-4 items-start">
        <div
          className={cn(
            'rounded-full p-2 flex items-center justify-center',
            getStatusColor()
          )}
        >
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium">{name}</h4>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
          {isNext && onRunStep && (
            <button
              onClick={onRunStep}
              className="mt-2 text-sm text-blue-500 hover:text-blue-600"
            >
              Run this step
            </button>
          )}
          {isCompleted && onResetStep && (
            <button
              onClick={onResetStep}
              className="mt-2 text-sm text-gray-500 hover:text-gray-600"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};