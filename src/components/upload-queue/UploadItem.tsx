import { X } from "lucide-react";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";

export type UploadItemType = {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'waiting' | 'error';
};

interface UploadItemProps {
  item: UploadItemType;
  onCancel?: (file: File) => void;
  isMobile: boolean;
}

export const UploadItem = ({ item, onCancel, isMobile }: UploadItemProps) => (
  <div className="p-4 flex items-center justify-between border-b border-gray-100 last:border-0">
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
);