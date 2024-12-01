import { Progress } from "./ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { UploadItem, UploadItemType } from "./upload-queue/UploadItem";

interface UploadQueueProps {
  items: UploadItemType[];
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
          <UploadItem
            key={item.file.name}
            item={item}
            onCancel={onCancel}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
};