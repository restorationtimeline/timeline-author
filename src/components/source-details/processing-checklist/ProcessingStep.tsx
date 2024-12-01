import React from 'react';
import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskStatus } from '@/integrations/supabase/types';

interface ProcessingStepProps {
  name: string;
  description?: string;
  status: TaskStatus;
  isLast?: boolean;
}

export const ProcessingStep = ({
  name,
  description,
  status,
  isLast = false,
}: ProcessingStepProps) => {
  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'processing':
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
      case 'processing':
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
        </div>
      </div>
    </div>
  );
};