import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Document = {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string;
  uploaded_at: string;
};

type ColumnProps = {
  id: string;
  title: string;
  icon: React.ReactNode;
  documents: Document[];
  showRetryButton?: boolean;
};

export const KanbanColumn = ({ id, title, icon, documents, showRetryButton }: ColumnProps) => {
  const navigate = useNavigate();
  const failedCount = documents.length;

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 p-3 rounded-lg min-h-[300px] md:min-h-[600px] shadow-sm border border-border/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {icon}
          <h3 className="text-sm font-medium text-foreground break-words">{title}</h3>
        </div>
        {showRetryButton && (
          <div className="flex gap-2 px-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors border border-gray-200 dark:border-gray-700"
              disabled={failedCount === 0}
              onClick={() => {
                toast.info("Retrying failed documents...");
              }}
              aria-label="Retry failed documents"
            >
              <RefreshCw className={`h-3 w-3 ${failedCount === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-blue-500'}`} />
            </Button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            className="p-2 mb-2 hover:shadow-md transition-shadow cursor-pointer bg-background dark:bg-gray-700/50"
            onClick={() => navigate(`/sources/${doc.id}`)}
          >
            <div>
              <h4 className="text-sm font-medium text-foreground break-words">{doc.name}</h4>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};