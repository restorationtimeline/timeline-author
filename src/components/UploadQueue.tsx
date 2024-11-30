import { X } from "lucide-react";
import { Progress } from "./ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export type UploadItem = {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'waiting' | 'error';
};

interface UploadQueueProps {
  items: UploadItem[];
  onCancel?: (file: File) => void;
}

export const UploadQueue = ({ items, onCancel }: UploadQueueProps) => {
  const isMobile = useIsMobile();
  
  if (items.length === 0) return null;

  const completedCount = items.filter(item => item.status === 'completed').length;
  const totalCount = items.length;
  const overallProgress = (completedCount / totalCount) * 100;

  const containerClasses = isMobile
    ? "fixed inset-0 bg-white z-50 flex flex-col"
    : "fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50";

  return (
    <div className={containerClasses}>
      <div className={cn(
        "p-4 border-b border-gray-200",
        isMobile && "bg-primary text-white"
      )}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">
            Uploading... {completedCount} of {totalCount} done ({Math.round(overallProgress)}%)
          </h3>
        </div>
        <Progress 
          value={overallProgress} 
          className={cn(
            "h-1",
            isMobile && "bg-white/20 [&>[data-role=indicator]]:bg-white"
          )} 
        />
      </div>
      <div className={cn(
        "overflow-y-auto",
        isMobile ? "flex-1" : "max-h-64"
      )}>
        {items.map((item) => (
          <div
            key={item.file.name}
            className="p-4 flex items-center justify-between border-b border-gray-100 last:border-0"
          >
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium truncate">{item.file.name}</p>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>
                  {item.status === 'completed'
                    ? 'Uploaded'
                    : item.status === 'waiting'
                    ? 'Waiting...'
                    : item.status === 'error'
                    ? 'Error'
                    : `${Math.round(item.progress)}%`}
                </span>
              </div>
              {item.status === 'uploading' && (
                <Progress 
                  value={item.progress} 
                  className={cn(
                    "h-1 mt-2",
                    isMobile && "[&>[data-role=indicator]]:bg-primary"
                  )} 
                />
              )}
            </div>
            {item.status !== 'completed' && onCancel && (
              <button
                onClick={() => onCancel(item.file)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cancel upload"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};